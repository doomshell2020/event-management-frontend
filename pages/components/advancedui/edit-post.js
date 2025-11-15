import React from 'react'
import dynamic from 'next/dynamic';
import Seo from '@/shared/layout-components/seo/seo';
const EditPostCom = dynamic(()=>import('@/shared/data/advancedui/edit-post-com'), { ssr: false })

const Editpost = () => {
  return (
    <div>
    <Seo title={"Edit-Post"}/>

      <EditPostCom/>
    </div>
  )
}
Editpost.layout = "Contentlayout"
export default Editpost