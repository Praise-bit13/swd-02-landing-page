/**
 * Closes the mobile navigation and synchronizes its accessible button state.
 *
 * @param {HTMLButtonElement} menuButton - The mobile navigation button.
 * @param {HTMLElement} navigation - The navigation element to close.
 * @returns {void}
 */
const closeMobileMenu = (menuButton, navigation) => {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation');
  navigation.classList.remove('open');
};

/**
 * Adds the mobile navigation's open, close, link, Escape, and resize behavior.
 *
 * @returns {void}
 */
const initMobileMenu = () => {
  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.getElementById('nav');

  if (!(menuButton instanceof HTMLButtonElement) || !navigation) {
    return;
  }

  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';

    if (isOpen) {
      closeMobileMenu(menuButton, navigation);
      return;
    }

    menuButton.setAttribute('aria-expanded', 'true');
    menuButton.setAttribute('aria-label', 'Close navigation');
    navigation.classList.add('open');
  });

  navigation.addEventListener('click', (event) => {
    if (event.target instanceof Element && event.target.closest('a')) {
      closeMobileMenu(menuButton, navigation);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
      closeMobileMenu(menuButton, navigation);
      menuButton.focus();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768) {
      closeMobileMenu(menuButton, navigation);
    }
  });
};

/**
 * Opens or closes a FAQ answer and keeps its accessibility state in sync.
 *
 * @param {HTMLButtonElement} questionButton - The FAQ question button.
 * @param {HTMLElement} answerPanel - The answer controlled by the button.
 * @param {boolean} shouldOpen - Whether the answer should be open.
 * @returns {void}
 */
const setAccordionItem = (questionButton, answerPanel, shouldOpen) => {
  const icon = questionButton.querySelector('span');

  questionButton.setAttribute('aria-expanded', String(shouldOpen));
  if (icon) {
    icon.textContent = shouldOpen ? '−' : '+';
  }

  if (shouldOpen) {
    answerPanel.hidden = false;
    answerPanel.removeAttribute('inert');
    answerPanel.setAttribute('aria-hidden', 'false');
    answerPanel.style.height = `${answerPanel.getBoundingClientRect().height}px`;

    requestAnimationFrame(() => {
      if (questionButton.getAttribute('aria-expanded') === 'true') {
        answerPanel.style.height = `${answerPanel.scrollHeight}px`;
      }
    });
    return;
  }

  answerPanel.setAttribute('inert', '');
  answerPanel.setAttribute('aria-hidden', 'true');

  if (answerPanel.hidden || answerPanel.getBoundingClientRect().height === 0) {
    answerPanel.style.height = '0px';
    answerPanel.hidden = true;
    return;
  }

  answerPanel.style.height = `${answerPanel.getBoundingClientRect().height}px`;
  answerPanel.offsetHeight;
  answerPanel.style.height = '0px';
};

/**
 * Initializes the FAQ accordion and allows at most one answer to stay open.
 *
 * @returns {void}
 */
const initAccordion = () => {
  const questionButtons = document.querySelectorAll('.question');
  const accordionItems = [];

  questionButtons.forEach((questionButton) => {
    if (!(questionButton instanceof HTMLButtonElement)) {
      return;
    }

    const answerId = questionButton.getAttribute('aria-controls');
    const answerPanel = answerId ? document.getElementById(answerId) : null;

    if (!answerPanel) {
      return;
    }

    const isOpen = questionButton.getAttribute('aria-expanded') === 'true';
    answerPanel.setAttribute('aria-hidden', String(!isOpen));
    answerPanel.style.height = isOpen ? `${answerPanel.scrollHeight}px` : '0px';

    if (!isOpen) {
      answerPanel.setAttribute('inert', '');
      answerPanel.hidden = true;
    } else {
      answerPanel.removeAttribute('inert');
      answerPanel.hidden = false;
    }

    answerPanel.addEventListener('transitionend', (event) => {
      if (event.target !== answerPanel || event.propertyName !== 'height') {
        return;
      }

      if (questionButton.getAttribute('aria-expanded') === 'true') {
        answerPanel.style.height = 'auto';
      } else {
        answerPanel.hidden = true;
        answerPanel.style.height = '0px';
      }
    });

    accordionItems.push({ questionButton, answerPanel });
  });

  accordionItems.forEach(({ questionButton, answerPanel }) => {
    questionButton.addEventListener('click', () => {
      const shouldOpen = questionButton.getAttribute('aria-expanded') !== 'true';

      accordionItems.forEach((item) => {
        if (item.questionButton !== questionButton) {
          setAccordionItem(item.questionButton, item.answerPanel, false);
        }
      });

      setAccordionItem(questionButton, answerPanel, shouldOpen);
    });
  });
};

/**
 * Updates visible prices, billing labels, and selection state for one period.
 *
 * @param {boolean} isYearly - Whether yearly prices should be displayed.
 * @param {HTMLButtonElement} billingSwitch - The accessible billing switch.
 * @returns {void}
 */
const updateBillingPeriod = (isYearly, billingSwitch) => {
  const period = isYearly ? 'yearly' : 'monthly';
  const priceElements = document.querySelectorAll('.price [data-monthly][data-yearly]');
  const periodLabels = document.querySelectorAll('[data-period]');
  const billedLabels = document.querySelectorAll('.billed');
  const yearlySavings = document.querySelectorAll('[data-savings]');
  const planOptions = document.querySelectorAll('#plan option');

  billingSwitch.setAttribute('aria-checked', String(isYearly));
  billingSwitch.setAttribute(
    'aria-label',
    isYearly ? 'Switch to monthly billing' : 'Switch to yearly billing',
  );

  periodLabels.forEach((label) => {
    label.classList.toggle('active', label.getAttribute('data-period') === period);
  });

  priceElements.forEach((priceElement) => {
    const price = isYearly ? priceElement.dataset.yearly : priceElement.dataset.monthly;

    if (price !== undefined) {
      priceElement.textContent = price;
    }
  });

  billedLabels.forEach((label) => {
    label.textContent = isYearly ? 'Billed annually' : 'Billed monthly';
  });

  yearlySavings.forEach((savingsLabel) => {
    savingsLabel.hidden = !isYearly;
  });

  planOptions.forEach((option) => {
    const optionLabel = isYearly ? option.dataset.yearly : option.dataset.monthly;

    if (optionLabel !== undefined) {
      option.textContent = optionLabel;
    }
  });
};

/**
 * Initializes the monthly/yearly pricing switch.
 *
 * @returns {void}
 */
const initPricingToggle = () => {
  const billingSwitch = document.getElementById('billing-switch');

  if (!(billingSwitch instanceof HTMLButtonElement)) {
    return;
  }

  let isYearly = billingSwitch.getAttribute('aria-checked') === 'true';

  billingSwitch.addEventListener('click', () => {
    isYearly = !isYearly;
    updateBillingPeriod(isYearly, billingSwitch);
  });

  updateBillingPeriod(isYearly, billingSwitch);

  const planSelect = document.getElementById('plan');
  document.querySelectorAll('[data-plan]').forEach((planLink) => {
    planLink.addEventListener('click', () => {
      if (planSelect instanceof HTMLSelectElement && planLink.dataset.plan) {
        planSelect.value = planLink.dataset.plan;
      }
    });
  });
};

/**
 * Applies a shadow to the sticky header after the page scrolls past 10 pixels.
 *
 * @returns {void}
 */
const initHeaderShadow = () => {
  const header = document.querySelector('.header');

  if (!header) {
    return;
  }

  const updateHeaderShadow = () => {
    header.classList.toggle('header--scrolled', window.scrollY > 10);
  };

  window.addEventListener('scroll', updateHeaderShadow, { passive: true });
  updateHeaderShadow();
};

/**
 * Updates the existing footer year to the current calendar year.
 *
 * @returns {void}
 */
const initFooterYear = () => {
  const yearElement = document.getElementById('year');

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear().toString();
  }
};

/**
 * Validates the signup fields, prevents duplicate emails, and stores valid signups.
 * localStorage is used for this frontend demonstration only; it is not a secure
 * production signup database.
 *
 * @returns {void}
 */
const initSignupForm = () => {
  const signupForm = document.getElementById('signup-form');
  const fullNameInput = document.getElementById('full-name');
  const emailInput = document.getElementById('email');
  const planSelect = document.getElementById('plan');
  const termsCheckbox = document.getElementById('terms');
  const fullNameError = document.getElementById('full-name-error');
  const emailError = document.getElementById('email-error');
  const planError = document.getElementById('plan-error');
  const termsError = document.getElementById('terms-error');
  const formMessage = document.getElementById('form-message');

  if (
    !(signupForm instanceof HTMLFormElement) ||
    !(fullNameInput instanceof HTMLInputElement) ||
    !(emailInput instanceof HTMLInputElement) ||
    !(planSelect instanceof HTMLSelectElement) ||
    !(termsCheckbox instanceof HTMLInputElement) ||
    !fullNameError ||
    !emailError ||
    !planError ||
    !termsError ||
    !formMessage
  ) {
    return;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const fields = [
    {
      control: fullNameInput,
      error: fullNameError,
      events: ['input'],
      validate: () =>
        fullNameInput.value.trim().length >= 2 ? '' : 'Enter a name with at least two characters.',
    },
    {
      control: emailInput,
      error: emailError,
      events: ['input'],
      validate: () =>
        emailPattern.test(emailInput.value.trim())
          ? ''
          : 'Enter a valid email address, such as alex@company.com.',
    },
    {
      control: planSelect,
      error: planError,
      events: ['change'],
      validate: () => (planSelect.value.trim() ? '' : 'Choose a plan to continue.'),
    },
    {
      control: termsCheckbox,
      error: termsError,
      events: ['change'],
      validate: () => (termsCheckbox.checked ? '' : 'Please agree to the terms to continue.'),
    },
  ];

  fields.forEach(({ control, error }) => {
    const descriptionIds = new Set(
      (control.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean),
    );
    descriptionIds.add(error.id);
    control.setAttribute('aria-describedby', [...descriptionIds].join(' '));
  });

  const showFieldError = (field, message) => {
    field.error.textContent = message;
    field.control.setAttribute('aria-invalid', String(Boolean(message)));
  };

  const validateField = (field) => {
    const message = field.validate();
    showFieldError(field, message);
    return message === '';
  };

  const clearFormMessage = () => {
    formMessage.textContent = '';
    formMessage.classList.remove('success', 'error');
  };

  const showFormMessage = (message, type) => {
    formMessage.textContent = message;
    formMessage.classList.remove('success', 'error');
    formMessage.classList.add(type);
  };

  const readStoredSignups = () => {
    try {
      const storedValue = window.localStorage.getItem('signups');
      if (!storedValue) {
        return { success: true, records: [] };
      }

      const records = JSON.parse(storedValue);
      if (!Array.isArray(records)) {
        return { success: false, records: [] };
      }

      return { success: true, records };
    } catch {
      return { success: false, records: [] };
    }
  };

  const clearAllFieldErrors = () => {
    fields.forEach((field) => showFieldError(field, ''));
  };

  let hasSubmitted = false;
  fields.forEach((field) => {
    field.events.forEach((eventName) => {
      field.control.addEventListener(eventName, () => {
        clearFormMessage();
        if (hasSubmitted) {
          validateField(field);
        }
      });
    });
  });

  signupForm.addEventListener('submit', (event) => {
    event.preventDefault();
    clearFormMessage();
    hasSubmitted = true;

    const isFormValid = fields.map(validateField).every(Boolean);
    if (!isFormValid) {
      return;
    }

    const storedSignups = readStoredSignups();
    if (!storedSignups.success) {
      showFormMessage(
        'We could not read saved signup data in this browser. Please try again later.',
        'error',
      );
      return;
    }

    const normalizedEmail = emailInput.value.trim().toLowerCase();
    const emailAlreadyExists = storedSignups.records.some(
      (record) =>
        record &&
        typeof record.email === 'string' &&
        record.email.trim().toLowerCase() === normalizedEmail,
    );

    if (emailAlreadyExists) {
      showFieldError({ control: emailInput, error: emailError }, "You've already signed up");
      return;
    }

    const signup = {
      name: fullNameInput.value.trim(),
      email: emailInput.value.trim(),
      plan: planSelect.value,
      createdAt: new Date().toISOString(),
    };

    try {
      window.localStorage.setItem(
        'signups',
        JSON.stringify([...storedSignups.records, signup]),
      );
    } catch {
      showFormMessage(
        'We could not save your signup in this browser. Check available storage and try again.',
        'error',
      );
      return;
    }

    signupForm.reset();
    clearAllFieldErrors();
    hasSubmitted = false;
    showFormMessage(
      `Thanks, ${signup.name}! Your ${signup.plan} workspace is ready to explore.`,
      'success',
    );
  });
};

/**
 * Initializes all LaunchDesk page interactions once the DOM is ready.
 *
 * @returns {void}
 */
const init = () => {
  initMobileMenu();
  initAccordion();
  initPricingToggle();
  initHeaderShadow();
  initFooterYear();
  initSignupForm();
};

document.addEventListener('DOMContentLoaded', init, { once: true });
