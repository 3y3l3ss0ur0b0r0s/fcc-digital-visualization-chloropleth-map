// API URLS
const education_api =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";
const county_api =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";

// GET API DATA THROUGH ASYNC FUNCTION
async function getAPIs(educationURL, countyURL) {
  // STORE RESPONSES
  const educationResponse = await fetch(educationURL);
  const countyResponse = await fetch(countyURL);

  // STORE DATA IN THE FORM OF JSON
  var educationData = await educationResponse.json();
  var countyData = await countyResponse.json();
  //console.log(educationData);
  //console.log(countyData);

  renderData(educationData, countyData);
}

function renderData(educationData, countyData) {
  console.log("In renderData()...");

  const eDataset = educationData;
  const cDataset = countyData;
  //console.log(eDataset);
  //console.log(cDataset);

  const myCounties = cDataset.objects.counties.geometries;
  //console.log(myCounties);

  // SVG WIDTH, HEIGHT, AND PADDING
  const w = 950;
  const h = 600;
  const padding = 20;

  // CREATE SVG
  const svg = d3
    .select("#graphics-box")
    .append("svg")
    .attr("width", w)
    .attr("height", h);

  // DRAW MAP

  const path = d3.geoPath();
  console.log("'path' created!");

  // https://forum.freecodecamp.org/t/d3-topojson-feature-explanation/235396/2
  // https://stackoverflow.com/questions/62333032/lets-make-a-topojson-map-and-view-it-with-d3-js

  topojsonObject = topojson.feature(cDataset, cDataset.objects.counties);
  //console.log(typeof topojsonObject);
  topojsonDataset = topojsonObject.features; // Mathematical description of the map to draw
  //console.log(typeof topojsonDataset);

  // TO GET EDUCATION DATA FROM eDataset; RETURNS AN OBJECT WITH THE EDUCATION INFO FROM THE EDUCATION JSON
  function getEData(someEDataset, someCounty) {
    let targetFips = someCounty.id;

    const educationObject = someEDataset.filter(
      (someObject) => someObject.fips == targetFips
    )[0];

    //console.log(educationObject + " being returned from getEData()...");

    return educationObject;
  }

  // COLORS
  const min = d3.min(eDataset.map((d) => d.bachelorsOrHigher));
  const max = d3.max(eDataset.map((d) => d.bachelorsOrHigher));

  function getFill(min, max, educationValue) {
    const colors = [
      "#fff",
      "#efe9f3",
      "#e0d3e8",
      "#d1bddd",
      "#c2a7d2",
      "#b391c7",
      "#a47bbc",
      "#9565b1",
      "#864ea6",
      "#77389b"
    ];

    let range = max - min;
    let segmentSize = range / 8;

    if (educationValue <= min + segmentSize / 2) {
      return colors[0];
    } else if (educationValue < min + segmentSize) {
      return colors[1];
    } else if (educationValue < min + segmentSize * 2) {
      return colors[2];
    } else if (educationValue < min + segmentSize * 3) {
      return colors[3];
    } else if (educationValue < min + segmentSize * 4) {
      return colors[4];
    } else if (educationValue < min + segmentSize * 5) {
      return colors[5];
    } else if (educationValue < min + segmentSize * 6) {
      return colors[6];
    } else if (educationValue < min + segmentSize * 7) {
      return colors[7];
    } else if (educationValue < min + segmentSize * 8) {
      return colors[8];
    } else if (educationValue < min + segmentSize * 9) {
      return colors[9];
    } else {
      return "#000";
    }
  }

  // CREATE TOOLTIP
  d3.select("#overlay")
    .append("div")
    .attr("id", "tooltip")
    .style("position", "absolute")
    .append("text")
    .attr("id", "line1Line");

  d3.select("#tooltip").append("text").attr("id", "line2Line");

  // DRAWING THE MAP
  svg
    .selectAll("path")
    .data(topojsonDataset)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("class", "county")
    .attr("data-fips", (d) => getEData(eDataset, d).fips)
    .attr("data-state", (d) => getEData(eDataset, d).state)
    .attr("data-area", (d) => getEData(eDataset, d).area_name)
    .attr("data-education", (d) => getEData(eDataset, d).bachelorsOrHigher)
    .on("mouseover", function (e, d) {
      //console.log("mouseover");

      let line1 = (
        d3.select(this).attr("data-area") +
        ", " +
        d3.select(this).attr("data-state")
      ).toString();
      let line2 = (
        "Residents with post-secondary degree: " +
        d3.select(this).attr("data-education") +
        "%"
      ).toString();

      console.log(line1);
      console.log(line2);

      const [x, y] = d3.pointer(e);

      d3.select("#tooltip")
        .style("visibility", "visible")
        .style("left", e.pageX + 20 + "px")
        .style("top", e.pageY - 20 + "px")
        .attr("data-education", d3.select(this).attr("data-education"));

      d3.select("#line1Line").text(line1);

      d3.select("#tooltip").select("#line2Line").text(line2);
    })
    .on("mouseout", function () {
      //console.log("mouseout");
      d3.select("#tooltip").style("visibility", "hidden");
    })
    .style("fill", (d) =>
      getFill(min, max, getEData(eDataset, d).bachelorsOrHigher)
    );

  // LEGEND...
  const legendPadding = 10;
  const legendHeight = 60;
  const legendWidth = 220;

  const legend = d3
    .select("#graphics-box")
    .append("div")
    .attr("id", "legend")
    .append("text")
    .text("Legend")
    .style("font-weight", "bold");

  legend.append("svg").attr("width", legendWidth).attr("height", legendHeight);

  const legendVariances = [0, 10, 20, 30, 40, 50, 60, 70, 80];

  const legendScale = d3
    .scaleLinear()
    .domain([d3.min(legendVariances) - 6, d3.max(legendVariances) + 6])
    .range([0, 182]);

  legend
    .select("svg")
    .attr("x", legendWidth / 2)
    .attr("y", legendHeight / 2)
    .selectAll("rect")
    .data(legendVariances)
    .enter()
    .append("rect")
    .attr("class", "colorBlock")
    .attr("x", (d) => legendScale(d - 5) + legendPadding)
    .attr("y", legendPadding)
    .attr("width", 20)
    .attr("height", 20)
    .style("fill", (d) => getFill(min, max, d));

  const legendAxis = d3.axisBottom(legendScale).tickFormat((x) => x + "%");

  legend
    .select("svg")
    .append("g")
    .attr("id", "legend-axis")
    .attr(
      "transform",
      "translate(" + legendPadding + "," + (20 + legendPadding) + ")"
    )
    .call(legendAxis);
}

getAPIs(education_api, county_api);
