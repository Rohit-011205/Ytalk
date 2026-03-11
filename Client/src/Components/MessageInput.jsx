// import React from 'react'
// import { useMessageStore } from '../Store/UseMessageStore.js'
// import { Image, Send, X } from "lucide-react";
// import toast from "react-hot-toast";
// import { useState, useRef } from 'react';
// import { useEffect } from 'react';

// const MessageInput = () => {

//     const [text, setText] = React.useState("")
//     const [imagePreview, setImagePreview] = useState(null)
//     const fileInputRef = useRef(null);
//     const {  sendMessage } = useMessageStore();

//     const handleImageChange = (e) => {
//         const file = e.target.files[0]

//         if (!file.type.startsWith("image/")) {
//             toast.error("Please select a valid image file.");
//             return;
//         }
//         const reader = new FileReader();

//         reader.onloadend = () => {
//             setImagePreview(reader.result);
//         }
//         reader.readAsDataURL(file);
//     }

//     const removeImage = () => {
//         setImagePreview(null);
//         if (fileInputRef.current) {
//             fileInputRef.current.value = null;
//         }
//     }

//     const handleSendMessage = async (e) => {
//         e.preventDefault();
//         if (!text.trim() && !imagePreview) {
//             toast.error("Cannot send empty message");
//             return;
//         }
//         try {
//             await sendMessage({
//                 text: text.trim(),
//                 image: imagePreview,
//             })

//             setText("");
//             setImagePreview(null)
//             if (fileInputRef.current) {
//                 fileInputRef.current.value = null;
//             }
//         } catch (error) {
//             console.log("Error in sending message:", error);
//             toast.error("Failed to send message. Please try again.");
//         }

//     }

//     return (
//         <div className="p-4 w-full">
//             {imagePreview && (
//                 <div className="mb-3 flex items-center gap-2">
//                     <div className="relative">
//                         <img
//                             src={imagePreview}
//                              alt="Preview"
//                             className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
//                         />
//                         <button
//                             onClick={removeImage}
//                             className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
//               flex items-center justify-center"
//                             type="button"
//                         >
//                             <X className="size-3" />
//                         </button>
//                     </div>
//                 </div>
//             )}

//             <form onSubmit={handleSendMessage} className="flex items-center gap-2">
//                 <div className="flex-1 flex gap-2">
//                     <input
//                         type="text"
//                         className="w-full input input-bordered rounded-lg input-sm sm:input-md"
//                         placeholder="Type a message..."
//                         value={text}
//                         onChange={(e) => setText(e.target.value)}
//                     />
//                     <input
//                         type="file"
//                         accept="image/*"
//                         className="hidden"
//                         ref={fileInputRef}
//                         onChange={handleImageChange}
//                     />

//                     <button
//                         type="button"
//                         className={`hidden sm:flex btn btn-circle
//                      ${imagePreview ? "text-emerald-500" : "text-zinc-400"}`}
//                         onClick={() => fileInputRef.current?.click()}
//                     >
//                         <Image size={20} />
//                     </button>
//                 </div>
//                 <button
//                     type="submit"
//                     className="btn btn-sm btn-circle"
//                     disabled={!text.trim() && !imagePreview}
//                 >
//                     <Send size={22} />
//                 </button>
//             </form>
//         </div>
//     )
// }

// export default MessageInput



import React, { useState, useRef } from "react";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";
import { useMessageStore } from "../Store/UseMessageStore.js";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const { sendMessage } = useMessageStore();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image");
      e.target.value = null;
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!text.trim() && !imagePreview) {
      toast.error("Cannot send empty message");
      return;
    }

    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
      });

      setText("");
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to send message");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto relative">
      {imagePreview && (
        <div className="absolute -top-20 left-4 p-1 bg-[#120a1d] border border-white/5 rounded-xl shadow-2xl">
          <img
            src={imagePreview}
            alt="preview"
            className="size-14 object-cover rounded-lg"
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute -top-2 -right-2 bg-black text-white rounded-full p-0.5"
          >
            <X size={10} />
          </button>
        </div>
      )}

      <form
        onSubmit={handleSendMessage}
        className="flex items-center gap-2 bg-[#0d0d0d] border border-white/5 p-1.5 rounded-full focus-within:border-purple-500/30 transition-all"
      >
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-zinc-500 hover:text-purple-400"
        >
          <Image size={18} />
        </button>

        <input
          type="text"
          className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-sm text-zinc-200 placeholder-zinc-700"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
          onChange={handleImageChange}
        />

        <button
          type="submit"
          disabled={!text.trim() && !imagePreview}
          className="p-2 text-purple-500 hover:bg-purple-500/10 rounded-full transition-all disabled:opacity-40"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
