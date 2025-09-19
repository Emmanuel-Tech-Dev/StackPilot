import { useEffect, useRef } from "react";
import * as G2Plot from "@antv/g2plot";

const useAntVChart = (chartType, config) => {
    const containerRef = useRef(null);
    const chartRef = useRef(null);

    useEffect(() => {
        // Don't proceed if no container or chart type
        if (!containerRef.current || !chartType || !G2Plot?.[chartType]) {
            return;
        }

        // Destroy existing chart before creating new one
        if (chartRef.current) {
            try {
                chartRef.current.destroy();
            } catch (error) {
                console.warn('Error destroying existing chart:', error);
            }
            chartRef.current = null;
        }

        try {
            // Create new chart dynamically
            const ChartClass = G2Plot[chartType];
            chartRef.current = new ChartClass(containerRef.current, {
                autoFit: true,
                ...config,
            });

            chartRef.current.render();
        } catch (error) {
            console.error('Error creating chart:', error);
        }

        // Cleanup function
        return () => {
            if (chartRef.current) {
                try {
                    // Check if the container still exists and is connected to DOM
                    if (containerRef.current && containerRef.current.parentNode) {
                        chartRef.current.destroy();
                    }
                } catch (error) {
                    console.warn('Error destroying chart during cleanup:', error);
                } finally {
                    chartRef.current = null;
                }
            }
        };
    }, [chartType, config]);

    // Additional cleanup on unmount
    useEffect(() => {
        return () => {
            if (chartRef.current) {
                try {
                    chartRef.current.destroy();
                } catch (error) {
                    console.warn('Error destroying chart on unmount:', error);
                } finally {
                    chartRef.current = null;
                }
            }
        };
    }, []);

    return { containerRef, chart: chartRef };
};

export default useAntVChart;