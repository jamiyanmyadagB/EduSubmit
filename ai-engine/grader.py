"""
Grading Module
Handles automated grading of student submissions using various algorithms
"""

import re
from typing import Dict, List, Tuple
from collections import Counter
import json


class GradingEngine:
    """
    Automated grading engine for student submissions
    """
    
    def __init__(self):
        self.grading_criteria = {
            'content_quality': 0.4,
            'completeness': 0.3,
            'formatting': 0.2,
            'timeliness': 0.1
        }
    
    def extract_keywords(self, text: str, keywords: List[str]) -> int:
        """
        Count how many required keywords are present in the submission
        """
        text_lower = text.lower()
        count = 0
        for keyword in keywords:
            if keyword.lower() in text_lower:
                count += 1
        return count
    
    def calculate_content_quality(self, submission_text: str, 
                                 required_keywords: List[str]) -> float:
        """
        Calculate content quality score based on keyword presence and text analysis
        """
        if not submission_text:
            return 0.0
        
        # Keyword coverage
        keyword_count = self.extract_keywords(submission_text, required_keywords)
        keyword_score = (keyword_count / len(required_keywords)) if required_keywords else 1.0
        
        # Word count analysis (minimum 100 words for good quality)
        word_count = len(submission_text.split())
        word_score = min(word_count / 100, 1.0)
        
        # Sentence structure (average sentence length between 10-30 words)
        sentences = re.split(r'[.!?]+', submission_text)
        if sentences:
            avg_sentence_length = sum(len(s.split()) for s in sentences) / len(sentences)
            structure_score = 1.0 if 10 <= avg_sentence_length <= 30 else 0.7
        else:
            structure_score = 0.0
        
        # Weighted average
        content_score = (keyword_score * 0.5 + word_score * 0.3 + structure_score * 0.2)
        return round(content_score, 2)
    
    def calculate_completeness(self, submission_text: str, 
                              required_sections: List[str]) -> float:
        """
        Calculate completeness score based on required sections
        """
        if not submission_text or not required_sections:
            return 0.0
        
        sections_found = 0
        for section in required_sections:
            if section.lower() in submission_text.lower():
                sections_found += 1
        
        completeness_score = sections_found / len(required_sections)
        return round(completeness_score, 2)
    
    def calculate_formatting(self, submission_text: str) -> float:
        """
        Calculate formatting score based on structure and presentation
        """
        if not submission_text:
            return 0.0
        
        score = 1.0
        
        # Check for proper paragraph structure
        paragraphs = submission_text.split('\n\n')
        if len(paragraphs) < 2:
            score -= 0.3
        
        # Check for proper sentence structure
        sentences = re.split(r'[.!?]+', submission_text)
        if not sentences or len(sentences) < 3:
            score -= 0.2
        
        # Check for excessive capitalization
        uppercase_ratio = sum(1 for c in submission_text if c.isupper()) / len(submission_text)
        if uppercase_ratio > 0.3:
            score -= 0.2
        
        # Check for proper spacing
        if '  ' in submission_text:  # Double spaces
            score -= 0.1
        
        return max(0.0, round(score, 2))
    
    def calculate_timeliness(self, submission_date: str, 
                           due_date: str) -> float:
        """
        Calculate timeliness score based on submission date vs due date
        """
        from datetime import datetime
        
        try:
            submission_dt = datetime.fromisoformat(submission_date)
            due_dt = datetime.fromisoformat(due_date)
            
            if submission_dt <= due_dt:
                return 1.0
            else:
                # Deduct points for late submission (10% per day late, max 50%)
                days_late = (submission_dt - due_dt).days
                penalty = min(days_late * 0.1, 0.5)
                return round(1.0 - penalty, 2)
        except:
            return 1.0  # Default to full score if dates are invalid
    
    def grade_submission(self, submission: Dict, rubric: Dict) -> Dict:
        """
        Grade a submission based on rubric criteria
        """
        submission_text = submission.get('text', '')
        submission_date = submission.get('submission_date', '')
        
        # Extract rubric requirements
        required_keywords = rubric.get('required_keywords', [])
        required_sections = rubric.get('required_sections', [])
        due_date = rubric.get('due_date', '')
        
        # Calculate individual scores
        content_quality = self.calculate_content_quality(submission_text, required_keywords)
        completeness = self.calculate_completeness(submission_text, required_sections)
        formatting = self.calculate_formatting(submission_text)
        
        if due_date and submission_date:
            timeliness = self.calculate_timeliness(submission_date, due_date)
        else:
            timeliness = 1.0
        
        # Calculate weighted final score
        final_score = (
            content_quality * self.grading_criteria['content_quality'] +
            completeness * self.grading_criteria['completeness'] +
            formatting * self.grading_criteria['formatting'] +
            timeliness * self.grading_criteria['timeliness']
        )
        
        # Convert to percentage
        final_percentage = round(final_score * 100, 2)
        
        # Determine letter grade
        letter_grade = self._get_letter_grade(final_percentage)
        
        # Generate feedback
        feedback = self._generate_feedback(content_quality, completeness, 
                                         formatting, timeliness)
        
        return {
            'submission_id': submission.get('id'),
            'final_score': final_percentage,
            'letter_grade': letter_grade,
            'breakdown': {
                'content_quality': round(content_quality * 100, 2),
                'completeness': round(completeness * 100, 2),
                'formatting': round(formatting * 100, 2),
                'timeliness': round(timeliness * 100, 2)
            },
            'feedback': feedback,
            'graded_at': submission.get('graded_at', '')
        }
    
    def _get_letter_grade(self, score: float) -> str:
        """
        Convert numerical score to letter grade
        """
        if score >= 90:
            return 'A'
        elif score >= 80:
            return 'B'
        elif score >= 70:
            return 'C'
        elif score >= 60:
            return 'D'
        else:
            return 'F'
    
    def _generate_feedback(self, content_quality: float, completeness: float,
                          formatting: float, timeliness: float) -> str:
        """
        Generate detailed feedback based on score breakdown
        """
        feedback_parts = []
        
        if content_quality >= 0.8:
            feedback_parts.append("Excellent content quality with good keyword coverage.")
        elif content_quality >= 0.6:
            feedback_parts.append("Good content quality, but could improve keyword usage.")
        else:
            feedback_parts.append("Content quality needs improvement. Focus on including required keywords.")
        
        if completeness >= 0.8:
            feedback_parts.append("All required sections are present.")
        elif completeness >= 0.6:
            feedback_parts.append("Most required sections are present, but some are missing.")
        else:
            feedback_parts.append("Several required sections are missing.")
        
        if formatting >= 0.8:
            feedback_parts.append("Well-formatted submission with proper structure.")
        elif formatting >= 0.6:
            feedback_parts.append("Formatting is acceptable but could be improved.")
        else:
            feedback_parts.append("Formatting needs significant improvement.")
        
        if timeliness < 1.0:
            feedback_parts.append("Late submission affected the overall grade.")
        
        return ' '.join(feedback_parts)
    
    def batch_grade(self, submissions: List[Dict], rubric: Dict) -> List[Dict]:
        """
        Grade multiple submissions in batch
        """
        results = []
        for submission in submissions:
            result = self.grade_submission(submission, rubric)
            results.append(result)
        return results


def grade_submission(submission: Dict, rubric: Dict) -> Dict:
    """
    Convenience function to grade a single submission
    """
    engine = GradingEngine()
    return engine.grade_submission(submission, rubric)
