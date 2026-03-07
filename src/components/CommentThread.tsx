"use client";

import { useState, useEffect } from "react";
import { addComment } from "@/actions/comment";

export default function CommentThread({ ticketId, comments, isCommittee }: { ticketId: string, comments: any[], isCommittee: boolean }) {
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setImageFile(null);
        if (imagePreview) URL.revokeObjectURL(imagePreview);
        setImagePreview(null);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        if (imageFile) {
            formData.append("image", imageFile);
        }
        try {
            await addComment(formData);
            (e.target as HTMLFormElement).reset();
            removeImage();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-800/20 p-6 sm:p-8 rounded-2xl border border-slate-700/50">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
                Activity Log & Communications
            </h3>

            <div className="space-y-6 mb-8">
                {comments.length === 0 ? (
                    <div className="text-center p-8 border border-dashed border-slate-700 rounded-xl">
                        <p className="text-slate-500 italic">No communication history yet.</p>
                    </div>
                ) : (
                    comments.map((comment, index) => {
                        const isInternal = comment.isInternalOnly;

                        return (
                            <div key={comment.id} className={`flex gap-4 ${index !== comments.length - 1 ? 'pb-6 border-b border-slate-700/30' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm shadow-inner
                  ${comment.author.role === "STUDENT" ? "bg-slate-700 text-slate-300" : "bg-blue-600 text-white"}
                  ${isInternal ? "border-2 border-yellow-500/50" : ""}
                `}>
                                    {comment.author.name?.charAt(0) || "U"}
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`font-semibold text-sm ${comment.author.role === "STUDENT" ? "text-slate-300" : "text-blue-400"}`}>
                                            {comment.author.name}
                                        </span>
                                        <span className="text-xs text-slate-500">•</span>
                                        <span className="text-xs text-slate-500 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">
                                            {mounted ? new Date(comment.createdAt).toLocaleString() : "..."}
                                        </span>
                                        {isInternal && (
                                            <span className="text-[10px] font-bold uppercase tracking-wider bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-0.5 rounded-full ml-auto">
                                                Internal Only
                                            </span>
                                        )}
                                    </div>
                                    <div className={`text-sm p-4 rounded-xl rounded-tl-none border 
                                        ${isInternal ? 'bg-yellow-500/5 border-yellow-500/10 text-yellow-100/90' : 'bg-slate-800/50 border-slate-700 text-slate-300'}`}>
                                        <p className="whitespace-pre-wrap">{comment.content}</p>

                                        {comment.imageUrl && (
                                            <div className="mt-4 max-w-sm rounded-lg overflow-hidden border border-slate-700/50 shadow-lg">
                                                <a href={comment.imageUrl} target="_blank" rel="noreferrer">
                                                    <img src={comment.imageUrl} alt="Comment Attachment" className="w-full h-auto max-h-64 object-cover hover:opacity-90 transition-opacity" />
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                <input type="hidden" name="ticketId" value={ticketId} />

                {isCommittee && (
                    <div className="flex items-center gap-2 mb-2 p-2 bg-yellow-500/5 rounded-lg border border-yellow-500/20">
                        <input
                            type="checkbox"
                            name="isInternalOnly"
                            value="true"
                            id="isInternalOnly"
                            className="w-4 h-4 text-yellow-500 rounded border-yellow-500/50 bg-slate-900 focus:ring-yellow-500 focus:ring-opacity-25 accent-yellow-500"
                        />
                        <label htmlFor="isInternalOnly" className="text-sm font-medium text-yellow-500/90 cursor-pointer select-none">
                            Internal Committee Note (Hidden from Student)
                        </label>
                    </div>
                )}

                <div>
                    <textarea
                        name="content"
                        required
                        rows={3}
                        className="input-field bg-slate-800 border-none rounded-lg"
                        placeholder="Type your message..."
                    ></textarea>
                </div>

                {imagePreview && (
                    <div className="relative inline-block mt-2">
                        <img src={imagePreview} alt="Preview" className="h-20 w-auto rounded border border-slate-700 object-cover" />
                        <button
                            type="button"
                            onClick={removeImage}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors"
                        >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                )}

                <div className="flex justify-between items-center mt-2">
                    <div>
                        <label className="cursor-pointer text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-slate-800 border border-transparent hover:border-slate-700">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm font-medium">Attach Image</span>
                            <input
                                type="file"
                                accept="image/jpeg, image/png, image/jpg"
                                className="hidden"
                                onChange={handleImageChange}
                            />
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-auto rounded-lg shadow-blue-500/20 flex items-center gap-2"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Sending...
                            </span>
                        ) : (
                            <>
                                Add Comment
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
