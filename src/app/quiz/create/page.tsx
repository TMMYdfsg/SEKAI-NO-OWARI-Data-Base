"use client";

import { useState } from "react";
import { UserQuiz, UserQuizQuestion, USER_QUIZZES } from "@/data/user-quiz";
import { Plus, Trash2, Save, CheckCircle, AlertCircle } from "lucide-react";
import { saveUserQuiz } from "@/lib/local-storage-data";

export default function CreateQuizPage() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [creator, setCreator] = useState("");
    const [questions, setQuestions] = useState<UserQuizQuestion[]>([
        { id: "q1", question: "", options: ["", "", "", ""], correctAnswerIndex: 0 }
    ]);
    const [isSaved, setIsSaved] = useState(false);

    const addQuestion = () => {
        setQuestions([
            ...questions,
            { id: `q${Date.now()}`, question: "", options: ["", "", "", ""], correctAnswerIndex: 0 }
        ]);
    };

    const removeQuestion = (index: number) => {
        if (questions.length > 1) {
            const newQuestions = [...questions];
            newQuestions.splice(index, 1);
            setQuestions(newQuestions);
        }
    };

    const updateQuestion = (index: number, field: keyof UserQuizQuestion, value: any) => {
        const newQuestions = [...questions];
        newQuestions[index] = { ...newQuestions[index], [field]: value };
        setQuestions(newQuestions);
    };

    const updateOption = (qIndex: number, oIndex: number, value: string) => {
        const newQuestions = [...questions];
        const newOptions = [...newQuestions[qIndex].options];
        newOptions[oIndex] = value;
        newQuestions[qIndex] = { ...newQuestions[qIndex], options: newOptions };
        setQuestions(newQuestions);
    };

    const handleSave = () => {
        // Validation logic here
        if (!title || !description || questions.some(q => !q.question || q.options.some(o => !o))) {
            alert("Please fill in all fields.");
            return;
        }

        const newQuiz: UserQuiz = {
            id: `quiz-${Date.now()}`,
            title,
            description,
            creator: creator || "Anonymous",
            createdAt: new Date().toISOString(),
            questions,
            tags: ["User Generated"]
        };

        // Save to local storage
        try {
            saveUserQuiz(newQuiz);
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 3000);

            // Optional: Reset form or redirect
        } catch (error) {
            console.error("Failed to save quiz", error);
            alert("Failed to save quiz. Local storage might be full.");
        }
    };

    return (
        <div className="min-h-screen py-24 px-4 bg-gradient-to-b from-background to-secondary/30 text-foreground">
            <div className="max-w-4xl mx-auto">
                <header className="mb-12 text-center">
                    <h1 className="text-4xl font-bold font-serif mb-4 text-primary">Create Your Quiz</h1>
                    <p className="text-muted-foreground">Share your SEKAI NO OWARI knowledge!</p>
                </header>

                <div className="bg-card/50 backdrop-blur border border-white/10 rounded-2xl p-8 shadow-xl space-y-8">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Quiz Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none"
                                placeholder="e.g. Rare Songs Quiz"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none h-24"
                                placeholder="Describe your quiz..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Creator Name</label>
                            <input
                                type="text"
                                value={creator}
                                onChange={(e) => setCreator(e.target.value)}
                                className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none"
                                placeholder="Your Name"
                            />
                        </div>
                    </div>

                    <div className="h-px bg-white/10" />

                    {/* Questions */}
                    <div className="space-y-8">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            Questions
                            <span className="text-sm font-normal text-muted-foreground bg-white/10 px-2 py-1 rounded-full">{questions.length}</span>
                        </h2>

                        {questions.map((q, qIndex) => (
                            <div key={q.id} className="bg-slate-900/40 p-6 rounded-xl border border-white/5 relative group">
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => removeQuestion(qIndex)}
                                        className="text-red-400 hover:bg-red-400/10 p-2 rounded-lg transition-colors"
                                        disabled={questions.length === 1}
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">Question {qIndex + 1}</label>
                                        <input
                                            type="text"
                                            value={q.question}
                                            onChange={(e) => updateQuestion(qIndex, "question", e.target.value)}
                                            className="w-full bg-transparent border-b border-white/20 p-2 focus:border-primary outline-none font-bold text-lg"
                                            placeholder="Enter question here..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {q.options.map((opt, oIndex) => (
                                            <div key={oIndex} className="flex items-center gap-3">
                                                <input
                                                    type="radio"
                                                    name={`correct-${q.id}`}
                                                    checked={q.correctAnswerIndex === oIndex}
                                                    onChange={() => updateQuestion(qIndex, "correctAnswerIndex", oIndex)}
                                                    className="accent-primary w-4 h-4 cursor-pointer"
                                                />
                                                <input
                                                    type="text"
                                                    value={opt}
                                                    onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                                    className={`flex-1 bg-slate-800/50 border ${q.correctAnswerIndex === oIndex ? "border-green-500/50" : "border-white/10"} rounded-lg p-2 text-sm focus:border-primary outline-none transition-colors`}
                                                    placeholder={`Option ${oIndex + 1}`}
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    <div>
                                        <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">Explanation (Optional)</label>
                                        <textarea
                                            value={q.explanation || ""}
                                            onChange={(e) => updateQuestion(qIndex, "explanation", e.target.value)}
                                            className="w-full bg-slate-800/30 border border-white/10 rounded-lg p-2 text-sm h-16 resize-none focus:border-primary outline-none"
                                            placeholder="Explain the answer..."
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={addQuestion}
                            className="w-full py-4 border-2 border-dashed border-white/20 rounded-xl text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center justify-center gap-2 font-bold"
                        >
                            <Plus size={20} /> Add Question
                        </button>
                    </div>

                    <div className="pt-8 flex justify-end">
                        <button
                            onClick={handleSave}
                            className={`px-8 py-3 rounded-full font-bold flex items-center gap-2 transition-all ${isSaved ? "bg-green-500 text-white" : "bg-primary text-primary-foreground hover:opacity-90"}`}
                        >
                            {isSaved ? <CheckCircle size={20} /> : <Save size={20} />}
                            {isSaved ? "Saved!" : "Save Quiz"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
