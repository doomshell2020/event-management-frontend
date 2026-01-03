import React, { useEffect, useState, useRef } from "react";
import SummernoteLite from "react-summernote-lite";
import 'react-summernote-lite/dist/summernote-lite.min.css';
import 'filepond/dist/filepond.min.css';
import $ from 'jquery'; // Summernote uses jQuery
import Swal from "sweetalert2";


const HtmlEditor = ({ editorRef, onChange, initialContent = "", placeholder = "Enter text here...", height = 200 }) => {
    const [isClient, setIsClient] = useState(false);
    const selectedImageRef = useRef(null);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Set initial content after mount
    useEffect(() => {
        if (isClient && initialContent) {
            const editableDiv = document.querySelector('.note-editable');
            if (editableDiv && editableDiv.innerHTML !== initialContent) {
                editableDiv.innerHTML = initialContent;
            }
        }
    }, [isClient, initialContent]);

    // Store reference to clicked image
    useEffect(() => {
        if (!isClient) return;

        const handleImageClick = (e) => {
            const image = e.target.closest('.note-editable img');
            if (image) {
                selectedImageRef.current = image;
            }
        };

        document.addEventListener('click', handleImageClick);

        return () => {
            document.removeEventListener('click', handleImageClick);
        };
    }, [isClient]);



    if (!isClient) return null;

    return (
        <SummernoteLite
            ref={editorRef}
            placeholder={placeholder}
            tabsize={2}
            height={height}
            dialogsInBody={true}
            blockquoteBreakingLevel={0}
            codeviewFilter={false}          // 👈 Allow full HTML
            codeviewIframeFilter={false}    // 👈 Specifically allow iframes
            toolbar={[
                ['style', ['style']],
                ['font', ['bold', 'underline', 'clear', 'strikethrough', 'superscript', 'subscript']],
                ['fontsize', ['fontsize']],
                ['fontname', ['fontname']],
                ['color', ['color']],
                ['para', ['ul', 'ol', 'paragraph']],
                ['table', ['table']],
                ['insert', ['link', 'picture', 'video', 'hr']],
                ['view', ['fullscreen', 'codeview', 'help']],
                // ['custom', ['replaceImage']]
            ]}
            // buttons={{
            //     replaceImage: customButton
            // }}
            fontNames={[
                'Arial', 'Georgia', 'Verdana', 'Didot-Ragular', 'Didot-Italic',
                'Satoshi', 'Satoshi-Bold', 'Satoshi-Italic', 'Satoshi-Light'
            ]}
            fontNamesIgnoreCheck={[
                'Arial', 'Georgia', 'Verdana', 'Didot-Ragular', 'Didot-Italic',
                'Satoshi', 'Satoshi-Bold', 'Satoshi-Italic', 'Satoshi-Light'
            ]}
            fontSizes={[
                "8",
                "9",
                "10",
                "11",
                "12",
                "14",
                "16",
                "18",
                "20",
                "22",
                "24",
                "28",
                "32",
                "36",
                "40",
                "44",
                "48",
                "54",
                "60",
                "66",
                "72",
                "78",
                "80",
                "82",
                "84",
                "86",
                "92",
                "98",
                "100",
                "102",
                "106",
                "108",
                "110",
                "116",
                "120",
            ]}
            onChange={(content) => {
                if (onChange) onChange(content);
            }}
            // callbacks={{
            //     onImageUpload: handleImageUpload
            // }}
        />
    );
};

// Optional helper
export const getHtmlEditorContent = () => {
  if (typeof document == "undefined") return ""; // SSR safe
  const editableDiv = document.querySelector(".note-editable");
  return editableDiv?.innerHTML || "";
};

export default HtmlEditor;
