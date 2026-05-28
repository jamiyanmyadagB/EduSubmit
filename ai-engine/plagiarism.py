"""
Plagiarism Detection Module
Handles plagiarism detection for student submissions using NLP techniques
"""

import re
from typing import List, Dict, Tuple
from collections import Counter
import difflib


class PlagiarismDetector:
    """
    Detects plagiarism in student submissions using various algorithms
    """
    
    def __init__(self):
        self.threshold = 0.7  # Similarity threshold for plagiarism
        
    def preprocess_text(self, text: str) -> str:
        """
        Preprocess text by removing special characters, lowercasing, and removing extra spaces
        """
        # Remove special characters and numbers
        text = re.sub(r'[^a-zA-Z\s]', '', text)
        # Convert to lowercase
        text = text.lower()
        # Remove extra spaces
        text = ' '.join(text.split())
        return text
    
    def calculate_jaccard_similarity(self, text1: str, text2: str) -> float:
        """
        Calculate Jaccard similarity between two texts
        """
        words1 = set(self.preprocess_text(text1).split())
        words2 = set(self.preprocess_text(text2).split())
        
        intersection = words1.intersection(words2)
        union = words1.union(words2)
        
        if not union:
            return 0.0
        
        return len(intersection) / len(union)
    
    def calculate_cosine_similarity(self, text1: str, text2: str) -> float:
        """
        Calculate cosine similarity using word frequency vectors
        """
        words1 = self.preprocess_text(text1).split()
        words2 = self.preprocess_text(text2).split()
        
        counter1 = Counter(words1)
        counter2 = Counter(words2)
        
        # Get all unique words
        all_words = set(counter1.keys()) | set(counter2.keys())
        
        # Create vectors
        vec1 = [counter1.get(word, 0) for word in all_words]
        vec2 = [counter2.get(word, 0) for word in all_words]
        
        # Calculate dot product
        dot_product = sum(a * b for a, b in zip(vec1, vec2))
        
        # Calculate magnitudes
        magnitude1 = sum(a ** 2 for a in vec1) ** 0.5
        magnitude2 = sum(b ** 2 for b in vec2) ** 0.5
        
        if magnitude1 == 0 or magnitude2 == 0:
            return 0.0
        
        return dot_product / (magnitude1 * magnitude2)
    
    def calculate_sequence_similarity(self, text1: str, text2: str) -> float:
        """
        Calculate similarity using sequence matching
        """
        text1 = self.preprocess_text(text1)
        text2 = self.preprocess_text(text2)
        
        return difflib.SequenceMatcher(None, text1, text2).ratio()
    
    def detect_plagiarism(self, submission_text: str, 
                          reference_texts: List[str]) -> Dict:
        """
        Detect plagiarism by comparing submission with reference texts
        Returns plagiarism report with similarity scores
        """
        results = []
        
        for i, reference_text in enumerate(reference_texts):
            jaccard = self.calculate_jaccard_similarity(submission_text, reference_text)
            cosine = self.calculate_cosine_similarity(submission_text, reference_text)
            sequence = self.calculate_sequence_similarity(submission_text, reference_text)
            
            # Calculate overall similarity (average of all methods)
            overall_similarity = (jaccard + cosine + sequence) / 3
            
            is_plagiarized = overall_similarity >= self.threshold
            
            results.append({
                'reference_id': i,
                'jaccard_similarity': round(jaccard, 4),
                'cosine_similarity': round(cosine, 4),
                'sequence_similarity': round(sequence, 4),
                'overall_similarity': round(overall_similarity, 4),
                'is_plagiarized': is_plagiarized
            })
        
        # Find maximum similarity
        max_similarity = max([r['overall_similarity'] for r in results]) if results else 0.0
        
        return {
            'plagiarism_detected': max_similarity >= self.threshold,
            'max_similarity': round(max_similarity, 4),
            'comparisons': results,
            'threshold': self.threshold
        }
    
    def detect_self_plagiarism(self, submissions: List[Dict]) -> Dict:
        """
        Detect self-plagiarism among multiple submissions from the same student
        """
        results = []
        
        for i in range(len(submissions)):
            for j in range(i + 1, len(submissions)):
                submission1 = submissions[i]
                submission2 = submissions[j]
                
                similarity = self.calculate_jaccard_similarity(
                    submission1['text'], 
                    submission2['text']
                )
                
                if similarity >= self.threshold:
                    results.append({
                        'submission1_id': submission1['id'],
                        'submission2_id': submission2['id'],
                        'similarity': round(similarity, 4),
                        'is_plagiarized': True
                    })
        
        return {
            'self_plagiarism_detected': len(results) > 0,
            'matches': results
        }


def detect_plagiarism(submission_text: str, reference_texts: List[str]) -> Dict:
    """
    Convenience function to detect plagiarism
    """
    detector = PlagiarismDetector()
    return detector.detect_plagiarism(submission_text, reference_texts)
