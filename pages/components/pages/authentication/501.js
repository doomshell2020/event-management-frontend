import React from 'react';
import { Row } from 'react-bootstrap';
import Link from "next/link"
import Seo from '@/shared/layout-components/seo/seo';

const Error501 = () => (
  <div>
      <Seo title={"501"}/>
  
					{/* <!-- row --> */}
					<Row>
						 {/* <!-- Main-error-wrapper --> */}
							<div className="main-error-wrapper wrapper-1 page page-h">
								<h1 className="">501<span className="tx-20">error</span></h1>
								<h2 className="">Oopps. The page you were looking for {`doesn't`} exist.</h2>
				<h6 className="">You may have mistyped the address or the page may have moved.</h6><Link className="btn btn-primary" href={`/components/dashboards/dashboard1/`}>Back to Home</Link>
							</div>
				        {/* <!-- /Main-error-wrapper --> */}

					</Row>
					{/* <!-- row closed --> */}
				</div>
 
);

Error501.propTypes = {};

Error501.defaultProps = {};

Error501.layout = "Contentlayout"

export default Error501;
