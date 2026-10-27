document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('nav');

  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      const willExpand = menuToggle.getAttribute('aria-expanded') !== 'true';
      menuToggle.setAttribute('aria-expanded', String(willExpand));
      nav.classList.toggle('open', willExpand);
    });
  }

  const billingSwitch = document.getElementById('billing-switch');
  const pricePeriods = document.querySelectorAll('[data-period]');
  const priceValues = document.querySelectorAll('.price strong');
  const billedFields = document.querySelectorAll('.billed');
  const planSelect = document.getElementById('plan');

  function updateBilling(isYearly) {
    const activePeriod = isYearly ? 'yearly' : 'monthly';

    pricePeriods.forEach((element) => {
      const isActive = element.dataset.period === activePeriod;
      element.classList.toggle('active', isActive);
    });

    billingSwitch?.setAttribute('aria-checked', String(isYearly));

    priceValues.forEach((element) => {
      const price = isYearly ? element.dataset.yearly : element.dataset.monthly;
      element.textContent = price;
    });

    billedFields.forEach((element) => {
      element.textContent = isYearly ? 'Billed annually' : 'Billed monthly';
    });

    if (planSelect) {
      const options = [...planSelect.options];
      options.forEach((option) => {
        const label = isYearly ? option.dataset.yearly : option.dataset.monthly;
        option.text = label;
      });
    }
  }

  if (billingSwitch) {
    let isYearly = false;
    billingSwitch.addEventListener('click', () => {
      isYearly = !isYearly;
      updateBilling(isYearly);
    });
    updateBilling(isYearly);
  }

  document.querySelectorAll('.question').forEach((button) => {
    button.addEventListener('click', () => {
      const targetId = button.getAttribute('aria-controls');
      const answer = targetId ? document.getElementById(targetId) : null;
      const isExpanded = button.getAttribute('aria-expanded') === 'true';
      const icon = button.querySelector('span');

      button.setAttribute('aria-expanded', String(!isExpanded));
      if (answer) {
        answer.hidden = isExpanded;
      }
      if (icon) {
        icon.textContent = isExpanded ? '+' : '−';
      }
    });
  });

  const signupForm = document.getElementById('signup-form');
  const formMessage = document.getElementById('form-message');

  if (signupForm && formMessage) {
    signupForm.addEventListener('submit', (event) => {
      event.preventDefault();

      if (!signupForm.checkValidity()) {
        signupForm.reportValidity();
        return;
      }

      const fullName = document.getElementById('full-name')?.value.trim() || 'there';
      const selectedPlan = document.getElementById('plan')?.value || 'your plan';

      formMessage.textContent = `Thanks, ${fullName}! Your ${selectedPlan} workspace is ready to explore.`;
      formMessage.classList.add('success');
      signupForm.reset();
    });
  }

  const yearNode = document.getElementById('year');
  if (yearNode) {
    yearNode.textContent = new Date().getFullYear();
  }
});
