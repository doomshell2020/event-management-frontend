import { useState } from "react";

const CalculateFees = () => {
    const [ticketPrice, setTicketPrice] = useState(100);

    const feePercent = 8;
    const feeAmount = (ticketPrice * feePercent) / 100;
    const customerPays = ticketPrice + feeAmount;

    const sliderPercent = (ticketPrice / 500) * 100;

    const handleChange = (e) => {
        setTicketPrice(Number(e.target.value));
    };

    return (
        <div id="calculator">
            <div className="container">
                <div className="row">

                    <div className="col-md-8 col-sm-7 col-12">
                        <div className="section-heading">
                            <h2 className="text-start">Calculate Your Fees</h2>
                            <p>Ticket Price</p>

                            {/* Slider */}
                            <div className="range-slider">
                                <input
                                    className="range-slider__range"
                                    type="range"
                                    min="0"
                                    max="500"
                                    value={ticketPrice}
                                    onChange={handleChange}
                                    style={{
                                        background: `linear-gradient(90deg, rgb(26,188,156) ${sliderPercent}%, rgb(215,220,223) ${sliderPercent}%)`
                                    }}
                                />
                                <span className="range-slider__value text-center position-relative d-inline-block text-white">
                                    {ticketPrice}
                                </span>
                            </div>

                            {/* Calculated Values */}
                            <div className="row g-3 mt-3">
                                <div className="col-md-4 col-sm-4 col-4 rang_f">
                                    <label className="form-label">Customer Pays</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={`$ ${customerPays.toFixed(2)}`}
                                        readOnly
                                    />
                                </div>

                                <div className="col-md-4 col-sm-4 col-4 rang_f">
                                    <label className="form-label">You Receive</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={`$ ${ticketPrice.toFixed(2)}`}
                                        readOnly
                                    />
                                </div>

                                <div className="col-md-4 col-sm-4 col-4 rang_f">
                                    <label className="form-label">Our Cost</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={`${feePercent}% (${feeAmount.toFixed(2)})`}
                                        readOnly
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Image */}
                    <div className="col-md-4 col-sm-5 col-12">
                        <div className="container_img">
                            <img
                                src="/assets/front-images/Calculate_Fees_img.png"
                                alt="Calculate Fees"
                                className="img-fluid"
                            />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CalculateFees;
