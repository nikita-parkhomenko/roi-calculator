document.addEventListener('DOMContentLoaded', function () {
  // === Utilities ===
  const parseNumber = (val) =>
    parseFloat((val || '').toString().replace(/[^\d.]/g, '')) || 0;

  const debounce = (fn, delay = 150) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), delay);
    };
  };

  // === Input-Slider Pairs Configuration ===
  const inputSliderPairs = [
    {
      inputId: 'sku-input',
      sliderId: 'sku-slider',
      min: 1,
      max: 1000000,
      format: (val) => val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','),
      parse: (val) => parseInt(val.replace(/,/g, '') || '0'),
    },
    {
      inputId: 'attributes-input',
      sliderId: 'attributes-slider',
      min: 1,
      max: 500,
      format: String,
      parse: parseNumber,
    },
    {
      inputId: 'time-input',
      sliderId: 'time-slider',
      min: 1,
      max: 3600,
      format: String,
      parse: parseNumber,
    },
    {
      inputId: 'languages-input',
      sliderId: 'languages-slider',
      min: 1,
      max: 25,
      format: String,
      parse: parseNumber,
    },
    {
      inputId: 'channel-input',
      sliderId: 'channel-slider',
      min: 1,
      max: 250,
      format: String,
      parse: parseNumber,
    },
    {
      inputId: 'rate-input',
      sliderId: 'rate-slider',
      min: 1,
      max: 150,
      format: String,
      parse: parseNumber,
    },
  ];

  // === Link Inputs and Sliders ===
  inputSliderPairs.forEach(({ inputId, sliderId, min, max, format, parse }) => {
    const input = document.getElementById(inputId);
    const slider = document.getElementById(sliderId);
    if (!input || !slider) return;

    slider.addEventListener('input', () => {
      input.value = format(slider.value);
      calculateStep1Summary();
    });

    input.addEventListener('input', () => {
      const value = parse(input.value);
      if (!isNaN(value) && value >= min && value <= max) {
        slider.value = value;
        calculateStep1Summary();
      }
    });

    input.addEventListener('blur', () => {
      input.value = format(parse(input.value));
    });

    input.value = format(parse(input.value));
  });

  // === Step 1: Manual Work Cost ===
  const fieldsEl = document.getElementById('manual-fields');
  const hoursEl = document.getElementById('manual-hours');
  const costEl = document.getElementById('manual-cost');

  function calculateStep1Summary() {
    const skus = parseNumber(document.getElementById('sku-slider')?.value);
    const attributes = parseNumber(document.getElementById('attributes-slider')?.value);
    const timePerAttr = parseNumber(document.getElementById('time-slider')?.value);
    const languages = parseNumber(document.getElementById('languages-slider')?.value);
    const channels = parseNumber(document.getElementById('channel-slider')?.value);
    const rate = parseNumber(document.getElementById('rate-slider')?.value) || 40;

    const totalFields = skus * attributes * languages * channels;
    const totalHours = (totalFields * timePerAttr) / 3600;
    const totalCost = totalHours * rate;

    if (fieldsEl) fieldsEl.textContent = totalFields.toLocaleString();
    if (hoursEl) hoursEl.textContent = Math.round(totalHours).toLocaleString();
    if (costEl) costEl.textContent = `€ ${Math.round(totalCost).toLocaleString()}`;

    updateStep2Summary();
    calculateStep3Revenue();
  }

  // === Step 2: Efficiency ===
  const dataQualitySlider = document.getElementById('data-quality-slider');
  const dataQualityInput = document.getElementById('data-quality-input');
  const step2HoursSavedEl = document.getElementById('step2-hours-saved');
  const step2CostSavedEl = document.getElementById('step2-cost-saved');

  if (dataQualitySlider && dataQualityInput) {
    dataQualitySlider.addEventListener('input', () => {
      dataQualityInput.value = dataQualitySlider.value;
      updateStep2Summary();
      calculateStep3Revenue();
    });

    dataQualityInput.addEventListener('input', () => {
      let val = parseNumber(dataQualityInput.value);
      val = Math.min(Math.max(val, 1), 100);
      dataQualitySlider.value = val;
      updateStep2Summary();
      calculateStep3Revenue();
    });
  }

  function updateStep2Summary() {
    const totalHours = parseNumber(hoursEl?.textContent);
    const rate = parseNumber(document.getElementById('rate-slider')?.value);
    const efficiency = parseNumber(dataQualitySlider?.value) || 50;

    const hoursSaved = Math.round((totalHours * (100 - efficiency) * 0.8) / 100);
    const costSaved = Math.round(hoursSaved * rate);

    if (step2HoursSavedEl) step2HoursSavedEl.textContent = hoursSaved.toLocaleString();
    if (step2CostSavedEl) step2CostSavedEl.textContent = `€ ${costSaved.toLocaleString()}`;
  }

  // === Step 3: Revenue Gain ===
  const skuToLaunchInput = document.getElementById('skus-to-launch');
  const skuToLaunchSlider = document.getElementById('skus-to-launch-slider');
  const launchTimeInput = document.getElementById('launch-time');
  const launchTimeSlider = document.getElementById('launch-time-slider');
  const averageRevenueInput = document.getElementById('average-revenue');
  const averageRevenueSlider = document.getElementById('average-revenue-slider');
  const averageSalesInput = document.getElementById('average-sales');
  const averageSalesSlider = document.getElementById('average-sales-slider');
  const revenueBox = document.getElementById('step3-revenue');

  function bindSliderInput(input, slider, callback) {
    if (!input || !slider) return;
    input.addEventListener('input', () => {
      slider.value = input.value;
      callback();
    });
    slider.addEventListener('input', () => {
      input.value = slider.value;
      callback();
    });
  }

  function calculateStep3Revenue() {
    const skus = parseNumber(skuToLaunchSlider?.value);
    const days = parseNumber(launchTimeSlider?.value);
    const revenue = parseNumber(averageRevenueSlider?.value);
    const sales = parseNumber(averageSalesSlider?.value);
    const quality = parseNumber(dataQualitySlider?.value);

    const impact = (days * (100 - quality) * 0.8) / 100;
    const totalRevenue = skus * revenue * sales * impact;

    if (revenueBox) {
      revenueBox.textContent = `€ ${Math.round(totalRevenue).toLocaleString()}`;
    }
  }

  bindSliderInput(skuToLaunchInput, skuToLaunchSlider, calculateStep3Revenue);
  bindSliderInput(launchTimeInput, launchTimeSlider, calculateStep3Revenue);
  bindSliderInput(averageRevenueInput, averageRevenueSlider, calculateStep3Revenue);
  bindSliderInput(averageSalesInput, averageSalesSlider, calculateStep3Revenue);

  // === Toggle Helpers ===
  window.toggleDetails = function (id) {
    const el = document.getElementById(id);
    if (el) el.hidden = !el.hidden;
  };

  // === Init ===
  calculateStep1Summary();
});
