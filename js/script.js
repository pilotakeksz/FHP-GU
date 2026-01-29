const config = {
  car: null,
  lightbar: null,
  decal: null,
  additionalLighting: [],
  accessories: []
};

document.querySelectorAll('select').forEach(select => {
  select.addEventListener('change', () => {
    config[select.id] = select.value;
    logConfig();
  });
});

document.querySelectorAll('.multi-select input').forEach(box => {
  box.addEventListener('change', () => {
    updateMulti();
    logConfig();
  });
});

function updateMulti() {
  config.additionalLighting = Array.from(
    document.querySelectorAll('.config-group:nth-of-type(4) input:checked')
  ).map(i => i.value);

  config.accessories = Array.from(
    document.querySelectorAll('.config-group:nth-of-type(5) input:checked')
  ).map(i => i.value);
}

function logConfig() {
  console.clear();
  console.table(config);
}
