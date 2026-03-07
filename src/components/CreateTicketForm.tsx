"use client";

import { useState } from "react";
import { createTicket } from "@/actions/ticket";

export default function CreateTicketForm({ onClose }: { onClose: () => void }) {
    const [loading, setLoading] = useState(false);

    // Image Upload State
    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [dragActive, setDragActive] = useState(false);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const filesArray = Array.from(e.target.files);
            addFiles(filesArray);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const filesArray = Array.from(e.dataTransfer.files);
            addFiles(filesArray);
        }
    };

    const addFiles = (filesArray: File[]) => {
        const validImages = filesArray.filter(file => file.type.startsWith('image/'));
        const totalNewImages = validImages.slice(0, 3 - images.length);

        if (totalNewImages.length > 0) {
            const newImages = [...images, ...totalNewImages];
            setImages(newImages);

            const newPreviews = totalNewImages.map(file => URL.createObjectURL(file));
            setPreviews([...previews, ...newPreviews]);
        }
    };

    const removeImage = (index: number) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);

        const newPreviews = [...previews];
        URL.revokeObjectURL(newPreviews[index]);
        newPreviews.splice(index, 1);
        setPreviews(newPreviews);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        images.forEach((img) => formData.append("images", img));

        try {
            await createTicket(formData);
            (e.target as HTMLFormElement).reset();
            setImages([]);
            setPreviews([]);
            onClose(); // Close the form upon success
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-panel p-6 rounded-xl animate-in slide-in-from-top-4 duration-300">
            <h2 className="text-xl font-semibold mb-4 border-b border-slate-700 pb-2">Submit New Issue</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Title / Brief Summary</label>
                        <input name="title" required className="input-field max-w-full" placeholder="e.g. WiFi dead zone in common room" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Category</label>
                        <select name="category" required className="input-field max-w-full">
                            <option value="WIFI">WiFi & Network</option>
                            <option value="PLUMBING">Plumbing</option>
                            <option value="ELECTRICAL">Electrical</option>
                            <option value="HOT_WATER">Hot Water</option>
                            <option value="HVAC">AC & Heating (HVAC)</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-slate-300">Detailed Description</label>
                        <textarea name="description" required rows={3} className="input-field max-w-full" placeholder="Describe the issue specifically..."></textarea>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Location</label>
                        <input name="location" required className="input-field max-w-full" placeholder="e.g. Dorm A, Room 302" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Priority</label>
                        <select name="priority" className="input-field max-w-full">
                            <option value="LOW">Low - Not urgent</option>
                            <option value="MEDIUM">Medium - Impacts daily routine</option>
                            <option value="HIGH">High - Urgent / Safety concern</option>
                        </select>
                    </div>

                    <div className="space-y-2 md:col-span-2 mt-2">
                        <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-700 bg-slate-800/50 cursor-pointer hover:bg-slate-700/50 transition-colors">
                            <div className="relative flex items-center">
                                <input type="checkbox" name="isAnonymous" value="true" className="peer sr-only" />
                                <div className="w-10 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-slate-200 block">Submit Anonymously</span>
                                <span className="text-xs text-slate-400">Your name will be hidden from the public and other students.</span>
                            </div>
                        </label>
                    </div>

                    {/* Drag and Drop Image Upload */}
                    <div className="space-y-2 md:col-span-2 mt-2">
                        <label className="text-sm font-medium text-slate-300">Attachments <span className="text-xs text-slate-500 font-normal">(Up to 3 images: JPG, JPEG, PNG)</span></label>

                        <div
                            className={`relative border-2 border-dashed rounded-xl p-6 transition-colors flex flex-col items-center justify-center text-center
                                ${dragActive ? 'border-blue-500 bg-blue-500/10' : 'border-slate-600 bg-slate-800/30 hover:border-slate-500 hover:bg-slate-800/50'}
                            `}
                            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); }}
                            onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); }}
                            onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); }}
                            onDrop={handleDrop}
                        >
                            <input
                                type="file"
                                multiple
                                accept="image/jpeg, image/png, image/jpg"
                                onChange={handleImageChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                disabled={images.length >= 3}
                            />
                            <div className="flex flex-col items-center gap-2 pointer-events-none">
                                <svg className={`w-8 h-8 ${dragActive ? 'text-blue-400' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <div>
                                    <span className="text-blue-400 font-medium font-semibold">Click to upload</span>
                                    <span className="text-slate-400"> or drag and drop</span>
                                </div>
                            </div>
                        </div>

                        {/* Previews */}
                        {previews.length > 0 && (
                            <div className="grid grid-cols-3 gap-4 mt-4">
                                {previews.map((src, index) => (
                                    <div key={index} className="relative aspect-video rounded-lg overflow-hidden border border-slate-700 group">
                                        <img src={src} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-2 right-2 bg-red-500/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <div className="pt-4 flex justify-end gap-3">
                    <button type="button" onClick={onClose} disabled={loading} className="btn-secondary w-auto flex-shrink-0">
                        Cancel
                    </button>
                    <button disabled={loading} type="submit" className="btn-primary w-auto flex-shrink-0 min-w-[120px]">
                        {loading ? "Submitting..." : "Submit Ticket"}
                    </button>
                </div>
            </form>
        </div>
    );
}
