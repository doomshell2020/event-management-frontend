import { formatPrice } from "@/utils/commonFunction";


const PaymentSummary = ({ orderData }) => {
// console.log('orderData :', orderData);
    const currency =
        orderData?.event?.currencyName?.Currency_symbol || "";

    return (
        <div className="border rounded p-4 bg-white">
            <h5 className="fw-bold mb-3">Payment Summary</h5>

            <div className="d-flex justify-content-between mb-2">
                <span>Total Amount</span>
                <span className="fw-bold">{currency} {orderData.sub_total}</span>
            </div>

            <div className="d-flex justify-content-between mb-2">
                <span>Discount</span>
                <span className="fw-bold">{currency} {orderData.discount_amount}</span>
            </div>

            <div className="d-flex justify-content-between mb-2">
                <span>Tax</span>
                <span className="fw-bold">{currency} {orderData.tax_total}</span>
            </div>

           <hr className="custom-hr" />

            <div className="d-flex justify-content-between fw-bold text-success">
                <span className="text-14">Total Paid</span>
                <span className="text-14">{currency} {formatPrice(orderData.grand_total)}</span>
            </div>
        </div>
    );
};

export default PaymentSummary;
