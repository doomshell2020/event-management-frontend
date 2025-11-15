import React from 'react';
import dynamic from 'next/dynamic';
import Seo from '@/shared/layout-components/seo/seo';
const Apexchartscom = dynamic(()=>import('@/shared/data/charts/apexchartscom'), { ssr: false })


const Apexcharts = () => {
    
return(<>
<Seo title={"Apex Charts"}/>
    <Apexchartscom/>
</>)
}
;

Apexcharts.propTypes = {};

Apexcharts.defaultProps = {};

Apexcharts.layout = "Contentlayout"

export default Apexcharts;
