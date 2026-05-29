#!/usr/bin/env python3
"""
EduSubmit AI Engine
Flask application for AI-powered academic features:
- Auto-grading
- Plagiarism detection
- AI Help assistant

Port: 5000
"""

import os
import re
import json
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional

from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from prometheus_flask_exporter import PrometheusMetrics

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='{"timestamp":"%(asctime)s","level":"%(levelname)s","service":"ai-engine","message":"%(message)s"}'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, origins=["*"])
metrics = PrometheusMetrics(app)

# ─────────────────────────────────────────────
# Configuration
# ─────────────────────────────────────────────
PORT = int(os.environ.get("PORT", 5000))
DEBUG = os.environ.get("DEBUG", "false").lower() == "true"

# In-memory store for plagiarism checks (use Redis in production)
submission_store = {}


# ─────────────────────────────────────────────
# NLTK & ML Setup
# ─────────────────────────────────────────────
NLTK_AVAILABLE = True  # Add this line
try:
    import nltk
    nltk.download('stopwords', quiet=True)
except Exception:
    NLTK_AVAILABLE = False

# ─────────────────────────────────────────────
# Helper Functions
# ─────────────────────────────────────────────
def calculate_word_count(text: str) -> int:
    """Count words in text."""
    return len(text.split())


def calculate_sentence_count(text: str) -> int:
    """Count sentences in text."""
    sentences = re.split(r'[.!?]+', text)
    return len([s for s in sentences if s.strip()])


def calculate_readability_score(text: str) -> float:
    """Calculate a simple readability score."""
    words = calculate_word_count(text)
    sentences = calculate_sentence_count(text)
    if sentences == 0:
        return 0.0
    avg_words_per_sentence = words / sentences
    # Simplified Flesch reading ease
    score = 206.835 - (1.015 * avg_words_per_sentence) - (84.6 * 0)  # avg syllables simplified
    return max(0, min(100, score))


def check_grammar_indicators(text: str) -> List[str]:
    """Check for common grammar and style issues."""
    issues = []

    # Check for repeated words
    words = text.lower().split()
    for i in range(len(words) - 1):
        if words[i] == words[i + 1] and len(words[i]) > 3:
            issues.append(f"Repeated word: '{words[i]}'")

    # Check sentence length
    sentences = re.split(r'[.!?]+', text)
    for sentence in sentences:
        if len(sentence.split()) > 40:
            issues.append("Very long sentence detected (>40 words)")
            break

    # Check for informal language
    informal_words = ["gonna", "wanna", "kinda", "sorta", "yeah", "nope", "dunno"]
    for word in informal_words:
        if word in text.lower():
            issues.append(f"Informal language: '{word}'")

    return issues


def analyze_content_depth(text: str, topic: str = "") -> Dict[str, Any]:
    """Analyze the depth and quality of content."""
    word_count = calculate_word_count(text)
    sentence_count = calculate_sentence_count(text)
    avg_sentence_length = word_count / max(sentence_count, 1)

    # Check for structure indicators
    has_intro = bool(re.search(r'^(this|in this|the purpose|this paper|introduction)', text.lower()))
    has_conclusion = bool(re.search(r'(conclusion|in conclusion|to conclude|summary|in summary)', text.lower()))
    has_references = bool(re.search(r'(reference|bibliography|cited|citation)', text.lower()))

    # Check for analytical language
    analytical_markers = [
        "analysis", "analyze", "evaluate", "assessment", "critique",
        "compare", "contrast", "examine", "investigate", "explore",
        "demonstrate", "evidence", "support", "argue", "claim",
        "however", "therefore", "furthermore", "consequently", "although",
        "significant", "important", "crucial", "essential", "impact"
    ]

    analytical_count = sum(1 for marker in analytical_markers if marker in text.lower())
    analytical_density = analytical_count / max(word_count, 1) * 100

    return {
        "word_count": word_count,
        "sentence_count": sentence_count,
        "avg_sentence_length": round(avg_sentence_length, 2),
        "has_introduction": has_intro,
        "has_conclusion": has_conclusion,
        "has_references": has_references,
        "analytical_markers_found": analytical_count,
        "analytical_density": round(analytical_density, 2),
        "has_structure": has_intro and has_conclusion,
    }


def calculate_plagiarism_score(text: str, submission_id: Optional[int] = None) -> Dict[str, Any]:
    """Calculate plagiarism score using TF-IDF + cosine similarity."""
    global submission_store

    if not NLTK_AVAILABLE:
        return {
            "similarity_percentage": round(0.0, 2),
            "matches": [],
            "message": "Plagiarism check requires scikit-learn"
        }

    # Store current submission
    if submission_id:
        submission_store[submission_id] = text

    if len(submission_store) < 2:
        return {
            "similarity_percentage": round(0.0, 2),
            "matches": [],
            "message": "Not enough submissions for comparison"
        }

    # Compare with other submissions
    documents = []
    doc_ids = []
    for sid, content in submission_store.items():
        if sid != submission_id:
            documents.append(content)
            doc_ids.append(sid)

    if not documents:
        return {
            "similarity_percentage": round(0.0, 2),
            "matches": []
        }

    try:
        vectorizer = TfidfVectorizer(stop_words="english", max_features=5000)
        all_docs = [text] + documents
        tfidf_matrix = vectorizer.fit_transform(all_docs)

        similarities = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()

        max_similarity = float(max(similarities)) if len(similarities) > 0 else 0.0
        matches = []

        for idx, sim in enumerate(similarities):
            if sim > 0.1:  # 10% threshold
                matches.append({
                    "submission_id": doc_ids[idx],
                    "similarity": round(float(sim) * 100, 2)
                })

        matches.sort(key=lambda x: x["similarity"], reverse=True)

        return {
            "similarity_percentage": round(max_similarity * 100, 2),
            "matches": matches[:5]  # Top 5 matches
        }

    except Exception as e:
        logger.error(f"Plagiarism check error: {e}")
        return {
            "similarity_percentage": round(0.0, 2),
            "matches": [],
            "error": str(e)
        }


def generate_auto_grade(text: str, assignment_id: int, rubric: str = "") -> Dict[str, Any]:
    """Generate auto-grade score and feedback."""
    analysis = analyze_content_depth(text)

    # Base score calculation (0-100)
    score = 60  # Base score

    # Word count factor (ideal: 500-2000 words)
    word_count = analysis["word_count"]
    if word_count >= 1000:
        score += 15
    elif word_count >= 500:
        score += 10
    elif word_count >= 250:
        score += 5
    else:
        score -= 10

    # Structure bonus
    if analysis["has_structure"]:
        score += 10
    if analysis["has_references"]:
        score += 5

    # Analytical depth
    if analysis["analytical_density"] > 5:
        score += 10
    elif analysis["analytical_density"] > 2:
        score += 5

    # Grammar check
    grammar_issues = check_grammar_indicators(text)
    score -= min(len(grammar_issues) * 2, 15)

    # Cap score
    score = max(0, min(100, score))

    # Generate feedback
    feedback_parts = []
    feedback_parts.append(f"Word count: {word_count} words ({'good' if word_count >= 500 else 'consider expanding'})")

    if analysis["has_structure"]:
        feedback_parts.append("Good document structure with introduction and conclusion.")
    else:
        feedback_parts.append("Consider adding a clearer introduction and conclusion.")

    if analysis["has_references"]:
        feedback_parts.append("References included - good academic practice.")
    else:
        feedback_parts.append("Add citations and references to support your arguments.")

    if grammar_issues:
        feedback_parts.append(f"Grammar/style notes: {len(grammar_issues)} issues found.")

    # Generate suggestions
    suggestions = []
    if word_count < 500:
        suggestions.append("Expand your content with more detail and examples")
    if not analysis["has_structure"]:
        suggestions.append("Add clear introduction and conclusion sections")
    if not analysis["has_references"]:
        suggestions.append("Include academic references to support claims")
    if analysis["analytical_density"] < 3:
        suggestions.append("Use more analytical language and critical thinking")
    if not suggestions:
        suggestions.append("Good work! Consider adding real-world case studies")

    return {
        "score": score,
        "feedback": " ".join(feedback_parts),
        "plagiarism_score": round(0.0, 2),
        "similar_submissions": [],
        "suggestions": suggestions,
        "analysis": analysis,
        "grammar_issues": grammar_issues[:5]
    }


def generate_ai_help_response(question: str, assignment_id: Optional[int] = None, context: str = "") -> str:
    """Generate AI help response based on question type."""
    question_lower = question.lower()

    # Question type detection
    if any(w in question_lower for w in ["what", "define", "explain"]):
        return (
            "Great question! To answer this effectively: "
            "1) Start by identifying the key concepts involved. "
            "2) Provide a clear, concise definition or explanation. "
            "3) Support your answer with examples or evidence. "
            "4) Connect the concept to the broader topic or course material. "
            "Remember to use your own words and cite any sources you reference."
        )

    elif any(w in question_lower for w in ["how", "steps", "process"]):
        return (
            "Here's how to approach this: "
            "1) Break down the task into smaller, manageable steps. "
            "2) Identify the resources and tools you'll need. "
            "3) Start with the foundational elements before moving to advanced parts. "
            "4) Test your work at each step to catch errors early. "
            "5) Document your process - this will help with your final write-up. "
            "Take your time and don't hesitate to ask for clarification if needed!"
        )

    elif any(w in question_lower for w in ["why", "reason", "cause"]):
        return (
            "That's a thoughtful question. When exploring the 'why': "
            "1) Consider multiple perspectives and factors. "
            "2) Look at historical context or background information. "
            "3) Identify cause-and-effect relationships. "
            "4) Examine evidence from credible sources. "
            "5) Consider counter-arguments for a balanced analysis. "
            "This kind of critical thinking will strengthen your work significantly."
        )

    elif any(w in question_lower for w in ["help", "stuck", "confused", "don't understand"]):
        return (
            "I'm here to help! Let's work through this together: "
            "1) Try to identify the specific part that's confusing you. "
            "2) Review the assignment requirements and rubric carefully. "
            "3) Break the problem into smaller pieces. "
            "4) Check if there are examples or sample solutions to reference. "
            "5) Consider discussing with classmates or posting in the course forum. "
            "Can you tell me more specifically what you're struggling with?"
        )

    elif any(w in question_lower for w in ["feedback", "improve", "better", "suggestion"]):
        return (
            "To improve your submission: "
            "1) Ensure you've addressed all parts of the assignment prompt. "
            "2) Check that your arguments are well-supported with evidence. "
            "3) Review your structure - clear intro, body, and conclusion. "
            "4) Proofread for grammar, spelling, and formatting. "
            "5) Verify all citations are correct and complete. "
            "6) Consider having someone else review your work for fresh perspective. "
            "Small improvements in each area can make a big difference!"
        )

    else:
        return (
            "Thanks for your question! Here's my guidance: "
            "1) Make sure you understand the assignment requirements fully. "
            "2) Plan your approach before starting - create an outline or mind map. "
            "3) Use credible sources and cite them properly. "
            "4) Focus on clarity and logical flow in your writing. "
            "5) Don't forget to proofread before submitting. "
            "If you have a more specific question, feel free to ask!"
        )


# ─────────────────────────────────────────────
# Flask Routes
# ─────────────────────────────────────────────

@app.route("/health", methods=["GET"])
def health_check():
    return {"status": "ok"}, 200



@app.route("/ai/grade", methods=["POST"])
def ai_grade():
    """
    POST /ai/grade
    Body: { text, assignmentId, rubric? }
    Returns: { score, feedback, plagiarism_score, similar_submissions, suggestions }
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON body provided"}), 400

        text = data.get("text", "")
        assignment_id = data.get("assignmentId", 0)
        rubric = data.get("rubric", "")

        if not text:
            return jsonify({"error": "text field is required"}), 400

        logger.info(f"Grading submission for assignment {assignment_id}")

        result = generate_auto_grade(text, assignment_id, rubric)

        # Also calculate plagiarism
        plagiarism_result = calculate_plagiarism_score(text)
        result["plagiarism_score"] = plagiarism_result["similarity_percentage"]
        result["similar_submissions"] = plagiarism_result.get("matches", [])

        return jsonify(result)

    except Exception as e:
        logger.error(f"Grade error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/ai/plagiarism-check", methods=["POST"])
def ai_plagiarism_check():
    """
    POST /ai/plagiarism-check
    Body: { text, submissionId }
    Returns: { similarity_percentage, matches }
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON body provided"}), 400

        text = data.get("text", "")
        submission_id = data.get("submissionId")

        if not text:
            return jsonify({"error": "text field is required"}), 400

        logger.info(f"Plagiarism check for submission {submission_id}")

        result = calculate_plagiarism_score(text, submission_id)
        return jsonify(result)

    except Exception as e:
        logger.error(f"Plagiarism check error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/ai/help", methods=["POST"])
def ai_help():
    """
    POST /ai/help
    Body: { question, assignmentId?, context? }
    Returns: { answer }
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON body provided"}), 400

        question = data.get("question", "")
        assignment_id = data.get("assignmentId")
        context = data.get("context", "")

        if not question:
            return jsonify({"error": "question field is required"}), 400

        logger.info(f"AI help question: {question[:100]}...")

        answer = generate_ai_help_response(question, assignment_id, context)
        return jsonify({"answer": answer})

    except Exception as e:
        logger.error(f"AI help error: {e}")
        return jsonify({"error": str(e)}), 500


# ─────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────

if __name__ == "__main__":
    logger.info(f"Starting EduSubmit AI Engine on port {PORT}")
    app.run(host="0.0.0.0", port=PORT, debug=DEBUG)
