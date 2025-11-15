// components/S3Image.js
import Image from 'next/image';

const S3Image = ({ src, alt = 'Image', folder = 'profiles', className = '', width, height }) => {
    const s3BaseUrl = process.env.NEXT_PUBLIC_S3_URL;
    const imageUrl = src ? `${s3BaseUrl}/${folder}/${src}` : '/default-profile.png';

    return (
        <Image
            className={className}
            src={imageUrl}
            alt={alt}
            width={width || 100}
            height={height || 100}
            unoptimized // if you're using external URLs and don't want Next.js optimization
            onError={(e) => {
                e.target.src = '/default-profile.png';
            }}
        />
    );
};

export default S3Image;
