import { Spinner } from "react-bootstrap";

const LoadingComponent = () => {
  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // White background with opacity
    zIndex: 9999, // Ensure it's above other elements
  };

  return (
    <div style={overlayStyle}>
        <Spinner animation="border" role="status" variant="primary" style={{ width: '30px', height: '30px' }}>
          <span className="sr-only">Loading...</span>
        </Spinner>
    </div>
  );
};

export default LoadingComponent;
