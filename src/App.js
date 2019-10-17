import React, { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";

const WIDTH = 800;
const HEIGHT = 400;
const MARGIN = { top: 20, right: 30, bottom: 30, left: 40 };

function ScatterPlot() {
  const [data, setData] = useState([]);
  // fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setData(
        await d3.csv(
          "https://gist.githubusercontent.com/mbostock/77a98cd519be20ea1f8e33bbd3617ac2/raw/574433e95e983b288a54f4d2217cb39d1557cd8d/mtcars.csv",
          ({ name, mpg: x, hp: y }) => ({ name, x: +x, y: +y })
        )
      );
    };
    fetchData();
  }, []);

  // randomize data every 1.5 seconds
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const nextData = data.slice().map(item => {
        if (item.x && item.y) {
          return {
            ...item,
            x: Math.min(
              Math.max(
                item.x + parseFloat((Math.random() * 10).toFixed(1)) - 5,
                0
              ),
              50
            ),
            y: Math.min(
              Math.max(
                item.y + parseFloat((Math.random() * 10).toFixed(1)) - 5,
                0
              ),
              400
            )
          };
        } else {
          return item;
        }
      });
      setData(nextData);
    }, 1500);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [data]);

  const scatterPlotRef = useRef(null);

  const x = d3
    .scaleLinear()
    .domain([0, 50])
    .nice()
    .range([MARGIN.left, WIDTH - MARGIN.right]);
  const xAxis = useCallback(
    g => {
      return g
        .attr("class", "x axis")
        .attr("transform", `translate(0,${HEIGHT - MARGIN.bottom})`)
        .call(d3.axisBottom(x))
        .call(g => g.select(".domain").remove())
        .call(g =>
          g
            .append("text")
            .attr("x", WIDTH - MARGIN.right)
            .attr("y", -4)
            .attr("fill", "#000")
            .attr("font-weight", "bold")
            .attr("text-anchor", "end")
            .text("Miles per gallon")
        );
    },
    [x]
  );

  const y = d3
    .scaleLinear()
    .domain([0, 400])
    .nice()
    .range([HEIGHT - MARGIN.bottom, MARGIN.top]);
  const yAxis = useCallback(
    g => {
      return g
        .attr("class", "y axis")
        .attr("transform", `translate(${MARGIN.left},0)`)
        .call(d3.axisLeft(y))
        .call(g => g.select(".domain").remove())
        .call(g =>
          g
            .select(".tick:last-of-type text")
            .clone()
            .attr("x", 4)
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .text("Horsepower")
        );
    },
    [y]
  );

  useEffect(() => {
    const svg = d3.select(scatterPlotRef.current);

    svg.append("g").call(xAxis);
    svg.append("g").call(yAxis);
    svg
      .append("g")
      .attr("class", "dots-container")
      .attr("stroke-width", 1.5)
      .attr("font-family", "sans-serif")
      .attr("font-size", 10);
  }, [scatterPlotRef, xAxis, yAxis]);

  useEffect(() => {
    const svg = d3.select(scatterPlotRef.current);

    const dataDot = g =>
      g
        .append("circle")
        .attr("stroke", "steelblue")
        .attr("fill", "none")
        .attr("r", 3);

    const dataText = g =>
      g
        .append("text")
        .attr("dy", "0.35em")
        .attr("x", 7)
        .text(d => d.name);

    svg
      .select(".dots-container")
      .selectAll("g")
      .data(data)
      .join(
        enter =>
          enter
            .append("g")
            .attr("transform", d => `translate(${x(d.x)},${y(d.y)})`)
            .attr("class", "dots")
            .call(dataDot)
            .call(dataText),
        update =>
          update
            .transition()
            .duration(500)
            .attr("transform", d => `translate(${x(d.x)},${y(d.y)})`),
        exit => exit.remove()
      );
  }, [data, scatterPlotRef, x, y]);

  return <svg width={WIDTH} height={HEIGHT} ref={scatterPlotRef} />;
}

export default ScatterPlot;
