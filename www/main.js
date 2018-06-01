// Set variables

const metric = document.getElementById('metric');
const defaultEndpoint = '/test_metric.txt';
const ruleForm = document.getElementById('form-rules-container');
const rulesContainer = document.getElementById('rules-list');
const addRuleBtn = document.getElementById('add-rule');
const saveRulesBtn = document.getElementById('save-rules');
const closeRulesFormBtn = document.getElementById('rules-close');

Array.prototype.sortOn = function (key) {
    this.sort(function (a, b) {
        if (a[key] < b[key]) {
            return -1;
        } else if (a[key] > b[key]) {
            return 1;
        }
        return 0;
    });
};

/**
 * Get endpoint value or reset it
 *
 * @return {string}
 */
function getEndpoint() {
    let endpoint = localStorage.getItem('endpoint');
    if (!endpoint) {
        endpoint = defaultEndpoint;
    }
    return endpoint;
}

/**
 * Validate endpoint value to be relative or external source
 *
 * @param endpoint
 * @return {boolean}
 */
function validateEndpoint(endpoint) {
    return (endpoint && (endpoint.indexOf('/') === 0 || endpoint.indexOf('http') !== -1));
}

/**
 * Get Metric from stored endpoint
 */
function getMetric() {
    let endpoint = getEndpoint();
    let endpointIsValid = validateEndpoint(endpoint);
    if (!endpointIsValid) {
        console.log('Invalid endpoint; resetting to default');
        endpoint = defaultEndpoint;
        localStorage.setItem(endpoint);
        return;
    }

    axios.get(endpoint)
        .then(function (response) {
            //console.log('response: ', response);
            formatMetric(response.data);
        })
        .catch(function (error) {
            if (error.response) {
                // Server response outside 2xx
                console.log(error.response.data);
            } else if (error.request) {
                // No response
                console.log(error.request);
            } else {
                console.log('Error', error.message);
            }
            metric.classList.add('error');
            metric.innerHTML = error;
        })
        .then(function () {
            setTimeout(function () {
                getMetric();
            }, 2000);
        });
}

/**
 * Retrieve rules and set metric color
 *
 * @param value
 */
function formatMetric(value) {
    // Retrieve rules
    const rules = JSON.parse(localStorage.getItem('rules'));
    let color = null;
    if (rules && rules.length) {
        rules.forEach(function (rule) {
            // Set the color based on the value
            if (value >= rule.num) {
                color = rule.hex;
            }
        });
    }
    // Set the metric
    metric.classList.remove('error');
    metric.style.color = '#' + color;
    metric.innerHTML = value;
}

/**
 * Display form upon control + 1 key combination
 *
 * @param evt
 */
document.onkeydown = function (evt) {
    evt = evt || window.event;
    let ctrlIsDown = evt.ctrlKey;
    let key = evt.key;
    let showForm = false;
    if (key === '1' && ctrlIsDown) {
        showForm = true;
    }
    if (showForm) {
        createRulesForm();
    }
};

/**
 * Generate the rules form
 */
function createRulesForm() {
    // @TODO create/populate from existing LocalStorage values
    ruleForm.classList.add('active');
}

/**
 * Close the form modal
 *
 */
function closeRulesForm(evt) {
    evt.preventDefault();
    ruleForm.classList.remove('active');
}

/**
 * Add a new rule row
 *
 * @param evt
 */
function handleAddRule(evt) {
    evt.preventDefault();

    let idx = document.querySelectorAll('#rules-list .rule').length;

    let ruleDiv = document.createElement('div');
    ruleDiv.id = 'rule-' + idx;
    ruleDiv.classList.add('rule');

    let fieldTotal = '<div class="field total">';
    fieldTotal += '<label for="rule-value-' + idx + '">Value</label>';
    fieldTotal += '<input type="text" name="rule-value-' + idx + '" id="rule-value-' + idx + '" value="" placeholder="0">';
    fieldTotal += '</div>';

    let fieldHex = '<div class="field hex">';
    fieldHex += '<label for="rule-hex-' + idx + '">Hex Color</label>';
    fieldHex += '<input type="text" name="rule-hex-' + idx + '" id="rule-hex-' + idx + '" value="" placeholder="999999">';
    fieldHex += '</div>';

    ruleDiv.innerHTML = fieldTotal + fieldHex;
    rulesContainer.appendChild(ruleDiv);
}

/**
 * Store rules in LocalStorage
 *
 * @param evt
 */
function storeRules(evt) {
    evt.preventDefault();

    // Store the endpoint
    let endpoint = document.getElementById('endpoint').value;
    let endPointIsValid = validateEndpoint(endpoint);
    if (!endPointIsValid) {
        endpoint = defaultEndpoint;
    }
    localStorage.setItem('endpoint', endpoint);

    // Retrieve and store all valid input values
    const rulesArr = [];
    let rulesTotal = document.querySelectorAll('#rules-list .rule').length;
    if (rulesTotal) {
        for (let i = 0; i < rulesTotal; i++) {
            const ruleValue = document.getElementById('rule-value-' + i).value;
            const hexValue = document.getElementById('rule-hex-' + i).value;
            if (ruleValue && hexValue) {
                rulesArr.push({num: ruleValue, hex: hexValue});
            }
        }
    }
    rulesArr.sortOn('num');
    localStorage.setItem('rules', JSON.stringify(rulesArr));
}

// Functionality

addRuleBtn.addEventListener('click', handleAddRule, false);
saveRulesBtn.addEventListener('click', storeRules, false);
closeRulesFormBtn.addEventListener('click', closeRulesForm, false);
getMetric();