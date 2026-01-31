/**
 * FHP Ghost Unit — Vehicle Configuration Checker
 * Fully hard-coded for HSPU and S.R.T. with rank inheritance
 */

(function () {
  "use strict";

  const divisionSelect = document.getElementById("division");
  const rankSelect = document.getElementById("rank");
  const vehicleSelect = document.getElementById("vehicle");
  const decalSelect = document.getElementById("decal");
  const lightbarSelect = document.getElementById("lightbar");
  const checkerResult = document.getElementById("checkerResult");
  const checkerBody = document.getElementById("checkerBody");
  const checkerToggle = document.getElementById("checkerToggle");
  const checkerArrow = document.getElementById("checkerArrow");
  const vehicleGuideContent = document.getElementById("vehicleGuideContent");

  if (!divisionSelect || !rankSelect) return;

  const RANK_ORDER = ["Probationary Officer","Officer First+","Senior Officer+","Head Officer+","Director+",
                      "Probationary Operative+","Operative+","Senior Operative+"];

  const rulesData = {
    "HSPU": {
      "Probationary Officer": {
        vehicles: ["Bullhorn Prancer Pursuit 2015 (Probationary Officer, officer+)"],
        mainLights: ["Visor Lights","Legacy Lightbar"],
        rearLights: ["Rear Window Lights"],
        additionalLighting: ["Side Window Lights","Plate Lights","Small Siderunners"],
        accessories: ["Pushbar","Wraparound Bar","Grappler","ALPR"],
        antennas: ["5G Antenna (Right)","Long Range Antenna (Center)","Low Profile Antenna (Front Center)"],
        spotlights: ["Led Spotlight","Passenger Spotlight (Optional)"]
      },
      "Officer First+": {
        vehicles: ["Chevron Amigo ZLR 2011 (Officer First+, Application)"],
        mainLights: ["Visor Lights","Legacy Lightbar"],
        rearLights: ["Rear Window Lights"],
        additionalLighting: ["Side Window Lights","Plate Lights","Small Siderunners"],
        accessories: ["Pushbar","Wraparound Bar","Grappler","ALPR"],
        antennas: ["5G Antenna (Right)","Long Range Antenna (Center)","Low Profile Antenna (Front Center)"],
        spotlights: ["Led Spotlight","Passenger Spotlight (Optional)"]
      },
      "Senior Officer+": {
        vehicles: ["Bullhorn Prancer Pursuit 2011 (Senior Officer+, Application)"],
        mainLights: ["Visor Lights","Legacy Lightbar"],
        rearLights: ["Rear Window Lights"],
        additionalLighting: ["Side Window Lights","Plate Lights","Small Siderunners"],
        accessories: ["Pushbar","Wraparound Bar","Grappler","ALPR"],
        antennas: ["5G Antenna (Right)","Long Range Antenna (Center)","Low Profile Antenna (Front Center)"],
        spotlights: ["Led Spotlight","Passenger Spotlight (Optional)"]
      },
      "Head Officer+": {
        vehicles: ["Falcon Stallion 350 2015 (Head Officer+, Application)"],
        mainLights: ["Visor Lights","Legacy Lightbar"],
        rearLights: ["Rear Window Lights"],
        additionalLighting: ["Side Window Lights","Plate Lights","Small Siderunners"],
        accessories: ["Pushbar","Wraparound Bar","Grappler","ALPR"],
        antennas: ["5G Antenna (Right)","Long Range Antenna (Center)","Low Profile Antenna (Front Center)"],
        spotlights: ["Led Spotlight","Passenger Spotlight (Optional)"]
      },
      "Director+": {
        vehicles: ["Bullhorn Prancer Pursuit Widebody 2020 (Director+)"],
        mainLights: ["Visor Lights","Legacy Lightbar"],
        rearLights: ["Rear Window Lights"],
        additionalLighting: ["Side Window Lights","Plate Lights","Small Siderunners"],
        accessories: ["Pushbar","Wraparound Bar","Grappler","ALPR"],
        antennas: ["5G Antenna (Right)","Long Range Antenna (Center)","Low Profile Antenna (Front Center)"],
        spotlights: ["Led Spotlight","Passenger Spotlight (Optional)"]
      }
    },
    "SRT": {
      "Probationary Operative+": {
        vehicles: ["2008 Chevlon Camion PPV","2015 Bullhorn Prancer Pursuit","Equipment Trailer"],
        mainLights: ["Visor Lights","Legacy Lightbar"],
        rearLights: ["Rear Window Lights"],
        additionalLighting: ["Side Window Lights","Plate Lights"],
        accessories: ["ALPR","Trailer Hitch"],
        antennas: ["5G Antenna - Right","Low Profile Antenna - Front Center","Long Range Antenna - Rear Center/Center"],
        spotlights: ["Led Spotlight","Passenger Spotlight (Optional)"]
      },
      "Operative+": {
        vehicles: ["2019 Chevlon Plotoro"],
        mainLights: ["Visor Lights","Legacy Lightbar"],
        rearLights: ["Rear Window Lights"],
        additionalLighting: ["Side Window Lights","Plate Lights"],
        accessories: ["ALPR","Trailer Hitch"],
        antennas: ["5G Antenna - Right","Low Profile Antenna - Front Center","Long Range Antenna - Rear Center/Center"],
        spotlights: ["Led Spotlight","Passenger Spotlight (Optional)"]
      },
      "Senior Operative+": {
        vehicles: [
          "2020 Emergency Services Falcon Advance+",
          "2011 SWAT Truck (only if more than 4 units active and Chief+ permission)"
        ],
        mainLights: ["Visor Lights","Legacy Lightbar"],
        rearLights: ["Rear Window Lights"],
        additionalLighting: ["Side Window Lights","Plate Lights","Front Bumper Lights (ES Falcon Advance+)","Fender Lights","Fog Lights","Small Siderunners","Siderunners (SO+)","Rear Light Stick"],
        accessories: ["ALPR","Trailer Hitch","LED Spotlights","Flood Lights (ES Falcon Advance+)"],
        antennas: ["5G Antenna - Right (Front Right on ES Falcon Advance+)","Low Profile Antenna - Front Center","Long Range Antenna - Rear Center/Center (Rear on ES Falcon Advance+)","Long Range Antenna (rear Center/ trunk center)"],
        spotlights: ["Led Spotlight","Passenger Spotlight (Optional)"]
      }
    }
  };

  const optionalRules = {"ALPR":"Pushbar","Trailer Hitch":null}; // Trailer Hitch optional

  /** ------------------ HELPER: INHERIT VEHICLES ------------------ **/

  function inheritVehicles() {
    Object.keys(rulesData).forEach(div=>{
      const ranks=Object.keys(rulesData[div]);
      const order=RANK_ORDER.filter(r=>ranks.includes(r));
      for(let i=0;i<order.length;i++){
        const lowerVehicles=[...rulesData[div][order[i]].vehicles];
        for(let j=i+1;j<order.length;j++){
          rulesData[div][order[j]].vehicles=[...new Set([...rulesData[div][order[j]].vehicles,...lowerVehicles])];
        }
      }
    });
  }

  inheritVehicles();

  /** ------------------ TAG INPUTS ------------------ **/
  function setupTagInput(containerId){
    const container=document.getElementById(containerId);
    if(!container) return ()=>[];
    const input=container.querySelector("input");
    let tags=[];
    function refresh(){
      container.querySelectorAll(".tag").forEach(t=>t.remove());
      tags.forEach(t=>{
        const tagEl=document.createElement("span");
        tagEl.className="tag"; tagEl.textContent=t;
        const x=document.createElement("span"); x.className="remove"; x.textContent="×";
        x.onclick=()=>{ tags=tags.filter(v=>v!==t); refresh(); checkConfig(); };
        tagEl.appendChild(x);
        container.insertBefore(tagEl,input);
      });
    }
    input.addEventListener("keydown",(e)=>{
      if(e.key==="Enter"&&input.value.trim()){ tags.push(input.value.trim()); input.value=""; refresh(); checkConfig(); e.preventDefault(); }
      else if(e.key==="Backspace"&&!input.value&&tags.length){ tags.pop(); refresh(); checkConfig(); }
    });
    return ()=>tags.slice();
  }

  const getLighting=setupTagInput("lightingContainer");
  const getAccessories=setupTagInput("accessoriesContainer");

  /** ------------------ POPULATE DROPDOWNS ------------------ **/

  function populateDivisions(){
    divisionSelect.innerHTML="<option value=''>Select Division</option>";
    Object.keys(rulesData).forEach(d=>{ const opt=document.createElement("option"); opt.value=d; opt.textContent=d; divisionSelect.appendChild(opt); });
  }

  function populateRanks(){
    const div=divisionSelect.value;
    rankSelect.innerHTML="<option value=''>Select Rank</option>";
    if(!div) return;
    Object.keys(rulesData[div]).forEach(r=>{
      const opt=document.createElement("option"); opt.value=r; opt.textContent=r; rankSelect.appendChild(opt);
    });
    vehicleSelect.innerHTML="<option value=''>Select Vehicle</option>";
    lightbarSelect.innerHTML="<option value=''>Select Lightbar</option>";
    decalSelect.innerHTML="<option value='Black Decal'>Black Decal</option>";
  }

  function updateVehiclesAndLightbar(){
    const div=divisionSelect.value; const rank=rankSelect.value;
    if(!div || !rank) return;
    const data=rulesData[div][rank];
    vehicleSelect.innerHTML="<option value=''>Select Vehicle</option>";
    data.vehicles.forEach(v=>{ const opt=document.createElement("option"); opt.value=v; opt.textContent=v; vehicleSelect.appendChild(opt); });
    lightbarSelect.innerHTML="<option value=''>Select Lightbar</option>";
    data.mainLights.forEach(l=>{ const opt=document.createElement("option"); opt.value=l; opt.textContent=l; lightbarSelect.appendChild(opt); });
    decalSelect.innerHTML="<option value='Black Decal'>Black Decal</option>";
  }

  divisionSelect.addEventListener("change",()=>{ populateRanks(); checkConfig(); });
  rankSelect.addEventListener("change",()=>{ updateVehiclesAndLightbar(); checkConfig(); });
  vehicleSelect.addEventListener("change",checkConfig);
  lightbarSelect.addEventListener("change",checkConfig);

  /** ------------------ CHECKER ------------------ **/

  function getData(){ const div=divisionSelect.value; const rank=rankSelect.value; return div && rank && rulesData[div] && rulesData[div][rank]?rulesData[div][rank]:null; }

  function checkConfig(){
    const data=getData();
    if(!data){ checkerResult.textContent="Select division and rank."; return; }
    const vehicle=vehicleSelect.value; const lightbar=lightbarSelect.value;
    const lighting=getLighting(); const accessories=getAccessories();
    const messages=[];

    if(!vehicle) messages.push("Select a vehicle.");
    else if(!data.vehicles.includes(vehicle)) messages.push(`Vehicle "${vehicle}" not allowed.`);

    if(!lightbar) messages.push("Select a lightbar.");
    else if(!data.mainLights.includes(lightbar)) messages.push(`Lightbar "${lightbar}" not allowed.`);

    // Additional lighting
    (data.additionalLighting||[]).forEach(l=>{ if(!lighting.includes(l)) messages.push(`Required additional lighting missing: ${l}`); });
    lighting.forEach(l=>{ if(![...data.mainLights,...data.rearLights,...(data.additionalLighting||[])].includes(l)) messages.push(`Additional lighting "${l}" not allowed.`); });

    // Accessories
    (data.accessories||[]).forEach(a=>{ 
      if(a!=="Trailer Hitch" && !accessories.includes(a)) messages.push(`Required accessory missing: ${a}`);
    });
    accessories.forEach(a=>{ 
      if(!(data.accessories||[]).includes(a)) messages.push(`Accessory "${a}" not allowed.`); 
      if(optionalRules[a] && !accessories.includes(optionalRules[a])) messages.push(`Accessory "${a}" requires "${optionalRules[a]}" to be selected.`);
    });

    checkerResult.textContent = messages.length? messages.join(" ") : "Configuration approved.";
    checkerResult.classList.toggle("error",messages.length>0);
    checkerResult.classList.toggle("ok",messages.length===0);
  }

  /** ------------------ STATIC VEHICLE GUIDE ------------------ **/

  function buildVehicleGuide(){
    vehicleGuideContent.innerHTML="";
    Object.keys(rulesData).forEach(div=>{
      const section=document.createElement("div");
      section.className="vehicle-guide-section";
      const h3=document.createElement("h3"); h3.textContent=div; section.appendChild(h3);

      Object.keys(rulesData[div]).forEach(rank=>{
        const data=rulesData[div][rank];
        const rankBlock=document.createElement("div");
        const title=document.createElement("h4"); title.textContent=rank; rankBlock.appendChild(title);

        function addList(label,items){
          if(!items||!items.length) return;
          const p=document.createElement("p"); p.className="guide-label"; p.textContent=label; rankBlock.appendChild(p);
          const ul=document.createElement("ul"); items.forEach(i=>{ const li=document.createElement("li"); li.textContent=i; ul.appendChild(li); }); rankBlock.appendChild(ul);
        }

        addList("Vehicles",data.vehicles);
        addList("Main Lights",data.mainLights);
        addList("Rear Lights",data.rearLights);
        addList("Additional Lighting",data.additionalLighting);
        addList("Accessories",data.accessories);
        addList("Antennas",data.antennas);
        addList("Spotlights",data.spotlights);
        section.appendChild(rankBlock);
      });

      vehicleGuideContent.appendChild(section);
    });
  }

  populateDivisions();
  buildVehicleGuide();
})();
