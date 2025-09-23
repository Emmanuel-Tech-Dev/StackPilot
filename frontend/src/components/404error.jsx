import React from 'react';
import { Content } from 'antd/es/layout/layout';
import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';
// Make sure to create this CSS file

const NotFound = ({ url }) => {
    const navigate = useNavigate();

    const handleGoHome = () => {
        navigate(url); // Change to your homepage route
    };

    return (
        <Content
            className="not-found-page"
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                minHeight: "100vh",
                textAlign: "center",
                // backgroundColor: "#111", // Dark background color from the image
                color: "#fff",
                position: "relative",
                overflow: "hidden"
            }}
        >
            <div className="notFound">404</div>
            <div className='text-black' style={{ position: "relative", zIndex: 1 }}>
                <h2 className='font-bold' style={{
                    fontSize: "3rem",
                    marginBottom: "16px",
                    color: "#000"// Light color to match the image
                }}>
                    Nothing to see here
                </h2>
                <p style={{

                    fontSize: "1rem",
                    marginBottom: "24px",
                    maxWidth: "500px",
                    margin: "0 auto 24px"
                }}>
                    Page you are trying to open does not exist. You may have mistyped the address, or the page has been moved to another URL. If you think this is an error contact support.
                </p>
                <Button
                    type="primary"
                    size="large"
                    onClick={handleGoHome}
                // style={{
                //     backgroundColor: "#2b87d1",
                //     borderColor: "#2b87d1",
                //     padding: "0 30px",
                //     height: "40px",
                //     borderRadius: "4px",
                //     fontSize: "1rem"
                // }}
                >
                    Take me back to home page
                </Button>
            </div>
        </Content>
    );
};

export default NotFound;