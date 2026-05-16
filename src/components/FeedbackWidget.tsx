import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Star } from 'lucide-react'; // Assuming lucide-react is available as per App.tsx imports

interface FeedbackWidgetProps {
    readingId: string;
}

const FeedbackWidget: React.FC<FeedbackWidgetProps> = ({ readingId }) => {
    const [rating, setRating] = useState(0);
    const [submitted, setSubmitted] = useState(false);

    const submitFeedback = async (score: number) => {
        try {
            setRating(score);
            // Write to Supabase
            const { error } = await supabase.from('reading_feedback').insert({
                reading_id: readingId,
                rating: score
            });

            if (error) throw error;

            setSubmitted(true);
            alert("感謝您的回饋！這將幫助星空狐狸更準確。");
        } catch (err) {
            console.error('Feedback error:', err);
            // Silently fail or minimal alert
        }
    };

    if (submitted) {
        return (
            <div className="text-center py-4">
                <p className="text-primary text-xs tracking-widest uppercase font-bold">Feedback Received</p>
            </div>
        );
    }

    return (
        <div className="feedback-area w-full max-w-md mx-auto mt-8 p-4 glass-panel rounded-2xl text-center">
            <p className="text-gray-300 text-xs tracking-widest uppercase mb-3 font-bold">Was this helpful?</p>
            <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                    <button
                        key={star}
                        onClick={() => submitFeedback(star)}
                        className="transition-transform hover:scale-110 focus:outline-none"
                    >
                        <Star
                            size={24}
                            className={star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}
                        />
                    </button>
                ))}
            </div>
        </div>
    );
};

export default FeedbackWidget;
