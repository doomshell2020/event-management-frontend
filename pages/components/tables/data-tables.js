import React from 'react';
import dynamic from 'next/dynamic';
import Seo from '@/shared/layout-components/seo/seo';
const DataTablesCom = dynamic(()=>import('@/shared/data/table/datatable/data-tables-com'), { ssr: false })



const DataTables = () => (
  <>
      <Seo title={"Data Tables"}/>

    <DataTablesCom/>
  </>
);

DataTables.propTypes = {};
DataTables.defaultProps = {};
DataTables.layout = "Contentlayout"

export default DataTables;
