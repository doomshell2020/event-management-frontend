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
                        // Show SweetAlert loading
                        Swal.fire({
                            title: 'Uploading...',
                            text: 'Please wait while the image is being uploaded.',
                            allowOutsideClick: false,
                            customClass: {
                                popup: "add-tckt-dtlpop",
                            },
                            didOpen: () => {
                                Swal.showLoading();
                            }
                        });

                        // Upload the file to your server
                        const formData = new FormData();
                        formData.append('ImageURL', file);

                        const response = await fetch(`/api/v1/updateImageS3`, {
                            method: 'POST',
                            body: formData,
                        });

                        const data = await response.json();
                        const imageUrl = data?.filePath || data?.url || `/uploads/profiles/${data}`;
                        selectedImage.src = imageUrl;
                        selectedImageRef.current = null;
                        // Trigger onChange with updated HTML
                        const editableDiv = document.querySelector('.note-editable');
                        if (editableDiv && onChange) {
                            onChange(editableDiv.innerHTML);
                        }

                        Swal.close();

                    } catch (error) {
                        Swal.close(); // Ensure it closes even on error
                        console.error("Image upload failed:", error);
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'Image upload failed. Please try again.',
                            customClass: {
                                popup: "add-tckt-dtlpop"
                            }
                        });

                    }
                }
            };
            input.click();
        } else {
            selectedImageRef.current = null;
            // Swal.fire('No Image Selected', 'Please click on an image inside the editor to replace it.', 'warning');
            Swal.fire({
                icon: 'warning',
                title: 'Warning',
                text: 'Please click on an image inside the editor to replace it.',
                customClass: {
                    popup: "add-tckt-dtlpop"
                }
            });

        }
    };

    const customButton = function (context) {
        const ui = $.summernote.ui;
        const button = ui.button({
            contents: '<i class="note-icon-picture" /> Replace Image',
            tooltip: 'Replace selected image',
            container: context.layoutInfo.editor[0],
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
        const formData = new FormData();
        formData.append('ImageURL', file);

        try {
            // Show SweetAlert loading
            Swal.fire({
                title: 'Uploading...',
                text: 'Please wait while the image is being uploaded.',
                allowOutsideClick: false,
                customClass: {
                    popup: "add-tckt-dtlpop",
                },
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const response = await fetch(`/api/v1/updateImageS3`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            const imageUrl = data?.filePath || data?.url || `/uploads/profiles/${data}`;

            Swal.close();

            // ✅ Replace the selected image's src
            if (selectedImageRef.current) {
                selectedImageRef.current.src = imageUrl;
            } else {
                // Fallback if no image selected
                editorRef.current.summernote("insertImage", imageUrl);
            }

        } catch (error) {
            Swal.close();
            console.error("Image upload failed:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Image upload failed. Please try again.',
                customClass: {
                    popup: "add-tckt-dtlpop"
                }
            });
        }
    };

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
            callbacks={{
                onImageUpload: handleImageUpload
            }}
        />
    );
};

// Optional helper
export const getHtmlEditorContent = () => {
  if (typeof document === "undefined") return ""; // SSR safe
  const editableDiv = document.querySelector(".note-editable");
  return editableDiv?.innerHTML || "";
};

export default HtmlEditor;
