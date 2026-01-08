import React, { useEffect, useRef, useState } from "react";
import SummernoteLite from "react-summernote-lite";
import "react-summernote-lite/dist/summernote-lite.min.css";
import $ from "jquery";
import Swal from "sweetalert2";
import api from "@/utils/api";

const HtmlEditor = ({ editorRef, onChange, initialContent = "", height = 500 }) => {
    const [isClient, setIsClient] = useState(false);
    const selectedImageRef = useRef(null);

    useEffect(() => setIsClient(true), []);

    // ✅ Set initial content
    useEffect(() => {
        if (!isClient || !initialContent) return;
        $(".note-editable").html(initialContent);
    }, [isClient, initialContent]);


    useEffect(() => {
        if (!isClient) return;

        const captureImageClick = (e) => {
            const img = e.target.closest('.note-editable img');
            if (!img) return;

            // 🔒 capture before toolbar blur
            selectedImageRef.current = img;

            document
                .querySelectorAll('.note-editable img')
                .forEach(i => i.classList.remove('selected-image'));

            img.classList.add('selected-image');

            console.log('IMAGE CAPTURED:', img.src);
        };

        // 👇 capture phase = TRUE
        document.addEventListener('mousedown', captureImageClick, true);

        return () => {
            document.removeEventListener('mousedown', captureImageClick, true);
        };
    }, [isClient]);



    // ✅ MOST IMPORTANT PART (Image selection)
    useEffect(() => {
        if (!isClient) return;

        const bindImageClick = () => {
            $(".note-editable")
                .off("click", "img")
                .on("click", "img", function () {
                    selectedImageRef.current = this;

                    $(".note-editable img").removeClass("selected-image");
                    $(this).addClass("selected-image");
                });
        };

        // bind after editor render
        setTimeout(bindImageClick, 500);

        return () => {
            $(".note-editable").off("click", "img");
        };
    }, [isClient]);

    if (!isClient) return null;

    // ✅ Replace Image
    const handleReplaceImage = () => {
        const selectedImage = selectedImageRef.current;
        if (!selectedImage) {
            Swal.fire({
                icon: "warning",
                title: "Warning",
                text: "Please click on an image inside the editor to replace it.",
            });
            return;
        }

        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";

        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const formData = new FormData();
                formData.append("image", file);

                const res = await api.post(
                    "/api/v1/admin/static/upload-image",
                    formData,
                    { headers: { "Content-Type": "multipart/form-data" } }
                );
                const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
                console.log("API_BASE_URL", API_BASE_URL)
                const imageUrl = `${API_BASE_URL}/uploads/static/${res.data.filename}` || `${API_BASE_URL}/uploads/static/${res.data.filename}`;
                selectedImage.src = imageUrl;

                selectedImageRef.current = null;
                $(".note-editable img").removeClass("selected-image");

                onChange?.($(".note-editable").html());
            } catch {
                Swal.fire("Error", "Image upload failed", "error");
            }
        };

        input.click();
    };

    // ✅ Toolbar Button
    const customButton = (context) => {
        const ui = $.summernote.ui;
        return ui.button({
            contents: '<i class="note-icon-picture"></i> Replace Image',
            tooltip: "Replace selected image",
            container: context.layoutInfo.editor[0],
            click: handleReplaceImage,
        }).render();
    };


    const bindImageSelection = () => {
        $(document)
            .off('mousedown', '.note-editable img')
            .on('mousedown', '.note-editable img', function (e) {
                e.preventDefault();
                e.stopPropagation();

                selectedImageRef.current = this;

                $('.note-editable img').removeClass('selected-image');
                $(this).addClass('selected-image');

                console.log('IMAGE SELECTED:', this.src);
            });
    };


    // replace hero banner image
    const handleReplaceHeroImage = () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";

        input.onchange = async (event) => {
            const file = event.target.files[0];
            if (!file) return;

            try {
                Swal.fire({
                    title: "Uploading...",
                    text: "Please wait while the image is being uploaded.",
                    allowOutsideClick: false,
                    customClass: { popup: "add-tckt-dtlpop" },
                    didOpen: () => Swal.showLoading(),
                });

                const formData = new FormData();
                // 👇 SAME key as local upload API
                formData.append("image", file);

                const res = await api.post(
                    "/api/v1/admin/static/upload-image",
                    formData,
                    { headers: { "Content-Type": "multipart/form-data" } }
                );

                const API_BASE_URL =
                    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

                const imageUrl = `${API_BASE_URL}/uploads/static/${res.data.filename}`;

                // 👇 background-image replace
                const editableDiv = document.querySelector(".note-editable");
                const heroDiv = editableDiv?.querySelector("#heroBanner");

                if (heroDiv) {
                    heroDiv.style.backgroundImage = `url('${imageUrl}')`;
                }

                // 👇 editor HTML update
                if (editableDiv && onChange) {
                    onChange(editableDiv.innerHTML);
                }

                Swal.close();
            } catch (error) {
                Swal.close();
                console.error("Image upload failed:", error);
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Image upload failed. Please try again.",
                    customClass: { popup: "add-tckt-dtlpop" },
                });
            }
        };

        input.click();
    };


    // hero banner image replace custom buttons
    const customHeroButton = function (context) {
        const ui = $.summernote.ui;
        const button = ui.button({
            contents: '<i class="note-icon-picture" /> Replace Hero Image',
            tooltip: 'Replace hero section image',
            container: context.layoutInfo.editor[0],
            click: () => handleReplaceHeroImage()  // create a separate handler if logic differs
        });
        return button.render();
    };








    return (
        <SummernoteLite
            ref={editorRef}
            placeholder={""}
            height={height}
            dialogsInBody={true}
            codeviewFilter={false}
            codeviewIframeFilter={false}
            onInit={() => {
                setTimeout(() => {
                    bindImageSelection();
                }, 500);
            }}

            toolbar={[
                ['style', ['style']],
                ['font', ['bold', 'underline', 'clear', 'superscript', 'subscript']],
                ['fontsize', ['fontsize']],
                ['fontname', ['fontname']],
                ['color', ['color']],
                ['para', ['ul', 'ol', 'paragraph']],
                ['table', ['table']],
                ['view', ['fullscreen', 'codeview', 'help']],
                ['custom', ['replaceImage', 'replaceHeroImage']]
                // ["style", ["style"]],
                // ["font", ["bold", "underline"]],
                // ["para", ["ul", "ol"]],
                // ["view", ["fullscreen", "codeview"]],
                // ["custom", ["replaceImage"]],
            ]}
            fontNames={[
                'Arial', 'Georgia', 'Verdana',
                'Satoshi', 'Satoshi-Bold', 'Satoshi-Italic'
            ]}

            fontSizes={[
                '10', '12', '14', '16', '18',
                '20', '24', '28', '32', '36',
                '48', '60', '72'
            ]}
            // buttons={{ replaceImage: customButton }}
            buttons={{
                replaceImage: customButton,
                replaceHeroImage: customHeroButton // ✅ register new one
            }}
            onChange={(content) => onChange?.(content)}

        />
    );
};
export const getHtmlEditorContent = (ref) => {
    if (ref?.current && typeof ref.current.summernote == 'function') {
        return ref.current.summernote('code');
    }
    return '';
};
export default HtmlEditor;
