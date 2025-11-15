import React from 'react'
import dynamic from 'next/dynamic';
import Seo from '@/shared/layout-components/seo/seo';
const FileDetailsCom = dynamic(()=>import('@/shared/data/app/file-details-com'), { ssr: false })

const FileDetails = () => {
  return (
    <div><Seo title={"File Details"}/>
    <FileDetailsCom/></div>
  )
}

FileDetails.layout = "Contentlayout"

export default FileDetails