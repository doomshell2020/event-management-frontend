import React, { useEffect, useState, useRef } from "react";
import SummernoteLite from "react-summernote-lite";
import 'react-summernote-lite/dist/summernote-lite.min.css';
import 'filepond/dist/filepond.min.css';
import $ from 'jquery'; // Summernote uses jQuery

const HtmlEditor = ({ editorRef, onChange, initialContent = "" }) => {
    const [isClient, setIsClient] = useState(false);
    const selectedImageRef = useRef(null); // store clicked image
    const [isEditorReady, setIsEditorReady] = useState(false);


    useEffect(() => {
        setIsClient(true);
    }, []);

    // Set initial content if provided
    useEffect(() => {
        if (isClient && editorRef?.current && initialContent) {
            try {
                $(editorRef.current).summernote('code', initialContent);
            } catch (err) {
                setTimeout(() => {
                    $(editorRef.current).summernote('code', initialContent);
                }, 500);
            }
        }
    }, [isClient, initialContent, editorRef]); // Added editorRef to dependencies

    // Store reference to clicked image
    useEffect(() => {
        if (!isClient) return;

        const handleImageClick = (e) => {
            if (e.target.tagName == 'IMG') {
                selectedImageRef.current = e.target;
            }
        };

        const editorContainer = document.querySelector('.note-editable');
        if (editorContainer) {
            editorContainer.addEventListener('click', handleImageClick);
        }

        return () => {
            if (editorContainer) {
                editorContainer.removeEventListener('click', handleImageClick);
            }
        };
    }, [isClient]);

    // Replace selected image
    const handleReplaceImage = () => {
        const selectedImage = selectedImageRef.current;
        if (selectedImage) {
            const input = document.createElement('input');

            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = async (event) => {
                const file = event.target.files[0];
                if (file) {
                    try {
                        // Upload the file to your server
                        const formData = new FormData();
                        formData.append('image', file);

                        const response = await fetch('/api/v1/cms/', {
                            method: 'POST',
                            body: formData,
                        });

                        const data = await response.json();
                        const imageUrl = data?.filePath || data?.url || `/uploads/profiles/${data}`;

                        // Replace the selected image's src with the uploaded image URL
                        selectedImage.src = imageUrl;
                        selectedImageRef.current = null;

                        // Trigger onChange with updated HTML
                        const editableDiv = document.querySelector('.note-editable');
                        if (editableDiv && onChange) {
                            onChange(editableDiv.innerHTML);
                        }
                    } catch (error) {
                        console.error("Image upload failed:", error);
                        alert("Image upload failed. Please try again.");
                    }
                }
            };
            input.click();
        } else {
            alert("Please click on an image inside the editor to replace it.");
        }
    };



    const customButton = function (context) { // Pass context as an argument
        const ui = $.summernote.ui;
        const button = ui.button({
            contents: '<i class="note-icon-picture" /> Replace Image',
            tooltip: 'Replace selected image',
            // *** IMPORTANT CHANGE HERE ***
            // Set the container to the Summernote editor itself
            container: context.layoutInfo.editor[0], // Access the DOM element
            click: handleReplaceImage
        });
        return button.render();
    };

    const handleImageUpload = async (files) => {
        const fileList = Array.from(files);
        for (let file of fileList) {
            await uploadImageToServer(file);
        }
    };

    const uploadImageToServer = async (file) => {
        const body = new FormData();
        body.append('image', file);
        try {
            const response = await fetch(`/api/v1/cms/`, {
                method: 'POST',
                body,
            });
            const data = await response.json();
            const imageUrl = data?.filePath || data?.url || `/uploads/profiles/${data}`;
            if (editorRef?.current?.summernote) {
                editorRef.current.summernote('insertImage', imageUrl);
                // Manually trigger onChange to update parent state after image upload
                if (onChange) {
                    onChange($(editorRef.current).summernote('code'));
                }
            }
        } catch (error) {
            console.error("Image upload failed:", error);
        }
    };

    if (!isClient) return null;

    return (
        <SummernoteLite
            ref={editorRef}
            placeholder={"Write something here..."}
            tabsize={2}
            height={500}
            dialogsInBody={true}
            blockquoteBreakingLevel={0}
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
                ['custom', ['replaceImage']]
            ]}
            buttons={{
                replaceImage: customButton
            }}
            fontNames={[
                'Arial', 'Georgia', 'Verdana', 'Didot-Ragular', 'Didot-Italic',
                'Satoshi', 'Satoshi-Bold', 'Satoshi-Italic', 'Satoshi-Light'
            ]}
            fontNamesIgnoreCheck={[
                'Arial', 'Georgia', 'Verdana', 'Didot-Ragular', 'Didot-Italic',
                'Satoshi', 'Satoshi-Bold', 'Satoshi-Italic', 'Satoshi-Light'
            ]}
            fontSizes={['8', '10', '12', '14', '16', '18', '20', '24', '28', '32', '36', '48', '60', '72', '100']}
            onChange={(content) => {
                if (onChange) onChange(content);
            }}
            onInit={() => setIsEditorReady(true)} // this is the key!

        // callbacks={{
        //     onImageUpload: handleImageUpload
        // }}
        />
    );
};

// Export helper to get editor content
export const getHtmlEditorContent = (ref) => {
    if (ref?.current && typeof ref.current.summernote == 'function') {
        return ref.current.summernote('code');
    }
    return '';
};

export default HtmlEditor;