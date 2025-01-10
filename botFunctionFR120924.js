
/*
    Change Notes:
    Lipsa: Added fetchButtonTemplate, fetchTextTemplate, fetchExitMsg, checkIntent, prepareUserPrompt, calculateAge, noIntentFound
    11032024_1252: Arul: Added emitCardRelatedSessionVariables
    11032024_1353: Lipsa: Added noEntityFound
    12032024_1821: Akhil: Added isBelfiusIban,emitPaymentTypeSessionVariables,emitCardSessionVariables,emitCardSessionVariables
    13032024_1737: Lipsa Fixed noEntityFound() function noIntentFound() function
    18032024_1819: Arul Updated checkIntent() function with subIntent
    19032024_1703: Lipsa Updating the calculateAge, noIntentFound, noEntityFound, isBelfiusIban
    20032024_1601: Arul made changes in checkIntent added check for FollowupIntent temporarily
    21032024_1709: Lipsa added ageChecker isSingleNumberEntered
    25032024_1521: Lipsa added noIntentAndEntityFound
    15042024_1713: Prasanna added findEntities
    15042024_1714: Lipsa Appending Dominque's Code
    15042024_1804: Lipsa Deleted kore prepareUserPrompt and modified Dominique's User prompt
    18042024_1240: Lipsa Update findEntities to handled default parament for entities
    18042024_2159: Lipsa Updated findEntities to handle traits
    190420204_1559: Lipsa updated the executeFlow and handleFunction to parameterize the defaultFlow
    190420204_1613: Lipsa updated fetchButtonTemplate as per Belfius suggestion
    22042024_1635: Lipsa updated fetchConfigParamValue
    23042024_1223 : Sahithi added delete context.FollowupIntents
    23042024_1608: Lipsa modified resolveIntents to add langugage specific logic
    24042024_2121: Lipsa fixed issue in checkIntent()
    25042024_1447: Lipsa added the function fetchAge
    25042024_1456: Lipsa updated function fetchConfigParamValue
    25042024_1542: Lipsa added isCreditCardNumber isDebitCardNumber isPrepaidCardNumber checkCardNumber
    24042024_1624: Lipsa added entity logging in findEntities
    24042024_1727: Lipsa added setResultValueNullExcept
    24042024_1859: Lipsa updated isCreditCardNumber isDebitCardNumber isPrepaidCardNumber 
    24042024_1906: Lipsa updated handleFallback making the values null after reaching exit message
    26042024_1410: sahithi added login status function in loadresponses
    26042024_1545: Lipsa added log in resolveIntents and fixed an issue in resolveIntents
    26042024_1642: Lipsa added fetchValuesToSave
    26042024_1733: Lipsa updated fetchAge
    02052024_1234 : sahithi updated card to cardNumber
    03052024_2050: Lipsa updated checkCardNumber
    06052024_1618: Lipsa modified resolveButton handling the case where via button click we are going into another flow and want to show the default message
    08052024_1722: Lipsa added isForeign
    09052024_1321: Lipsa in resolveIntents handled inactiveIntents to avoid looping issues between intent
    09052024_2236: Lipsa handled notUnderstood in resolveIntent
    10052024_2142: Lipsa handled subIntents in resolveIntents
    10052024_2237: Lipsa fixed an issue related to not.understood in the resolveIntents
    22052024_2153: Lipsa consolidated all the merge changes. Updated the updated setStateValueBasedOnConditions cleaned up the function showButtonTitleWorkaround
    24052024_1312: Arul Updated findEntities to handle BotUserSessions
    24052024_2106: Lipsa added logging updated for resolveIntent and resolveConcept and moved the setUpdatedFlags condition after entities conditions are resolved
    24052024_1138: Lipsa fixed issue in resolveIntents
    27052024_2225: Lipsa fixed an issue in findEntities
    31052024_1144: Lipsa called setStateValuesToNull if the resultValues.state.value == null
    08062024_1326: Lipsa made changes in the calculateAge and renamed ageChecker to ageRangeValidator updated fetchAge to add validation from year entity
    08062024_1353: Lipsa made changes in noEntityFound
    13062024_1813: Lipsa moved the logic for setting inactiveIntent in resolveIntent to the beginning
    25062024_1321: Lipsa added isConceptsQualfied
    16-Jul-2024: Dominique created the `CoveoHandler`, updated `saveCustomerJourney`, and modified the intents map.
    19-Jul-2024: Dominique updated the `CoveoHandler` to address issues with double encoding and removed unnecessary tags from result titles.
    23-Jul-2024: Dominique updated `filterEntitiesByConfidence` to ignore system entities to avoid overrides.
    16-Aug-2024: Dominique updated the `CoveoHandler` to make language settings dynamic instead of hardcoded.
    16-Aug-2024: Dominique updated the `fetchConfigParamValue` function to handle both emulator and real backend variables based on the setup, and to manage unexpected inputs.
    16-Aug-2024: Dominique created the `FlowUtil` class to consolidate and centralize helper functions for better code organization and reusability.
    16-Aug-2024: Dominique added the `ContactCenterHandler` class
    16-Aug-2024: Dominique enhanced debugging by checking for `debugMode`, which reduces unnecessary log calls in production.
    19-Aug-2024: Dominique resolveIntents to allow for intentional non-interruption of flow execution
    20-Aug-2024: Dominique setUpdatedFlags for better type handling
    28-Aug-2024: Dominique fetchButtonTemplate to match Gem3 integration
    11-Sep-2024: Dominique forcing PRD endpoint in Coveo due to issue with the non-PRD database
    11-Sep-2024:  Updated resolveButton to allow for function to be executed as part of the payload.



*/

/**
 * Added by Kore
 * **/
const currentLanguage = context.currentLanguage

/**
 * Added by Kore
 * 
 * Check if any of the configured concepts have got identified  
 * **/
function isConceptsQualfied() {
    let entitiesQualfied = []
    for (const concept of Object.keys(flowConcepts)) {
        const values = flowConcepts[concept].values;
        const entities = fetchValuesToSave(values,entityValues )
        if (entities.length) entitiesQualfied.push(entities)
    }
    koreDebugger.log(`entitiesQualfied ${JSON.stringify(entitiesQualfied)}`)
    return entitiesQualfied.length
}


/**
 * Added by Kore
 * **/
function isForeign (entityValues) {
    return entityValues.isForeignTrue || (entityValues.country && entityValues.country?.alpha2 != 'BE') || entityValues.isAbroadTrue
}

/**
 * Added by Kore
 * Fetch the entity keys which are to be saved 
 * @param conceptValues The concept array from which we are fetching the valuesToSave
 * @param entityValues The entities which are qualified
*/
function fetchValuesToSave (conceptValues, entityValues) {
    const valuesToSave = []
    for (key of Object.keys(entityValues)) {
        if (conceptValues.includes(key)) valuesToSave.push(key)
    }
    return valuesToSave
}

/**
 * Added by Kore
 * Set the resultValue of the concepts to null except for the concept mentioned in the concepts array
 * @param {Object} resultValues The current result values for each concepts
 * @param {string[]} concepts Array of concept keys
 */
function setResultValueNullExcept (resultValues, concepts = []) {
    concepts.push('state', 'stateCount')
    for (const key of Object.keys(resultValues)) {
        if (!concepts.includes(key) && resultValues[key]) resultValues[key].value = null
    }
}

/**
 * Added by Kore
 * **/
function fetchAge (entityValues) {


    //if date is identified
    if (entityValues.date) return calculateAge(entityValues.date);
    // if year is identified
    if (entityValues.year) return calculateAge(entityValues.year);
    // Either age is ner tagged or age is captured as standard entity
    // Absolute is to handle the corner case of age being
    if (entityValues.age) return Math.abs(entityValues.age?.amount || parseInt(entityValues.age))

    //if user just provided a number
    koreDebugger.log(`userInput is ${context.NLAnalysis.userInput}`)
    const userInput = context.NLAnalysis.userInput
    if (isSingleNumberEntered(userInput)) return parseInt(userInput)
}

/**
 * Added by Kore
 * **/
function isCreditCardNumber (entityValues) {
    const creditCardNumberRegex = /^(?:4454|4569|5398|5440|5477|5218)/
    return checkCardNumber(entityValues, creditCardNumberRegex)
}

/**
 * Added by Kore
 * **/
function isDebitCardNumber (entityValues) {
    const debitCardNumberRegex = /^(?:5169|5255)/
    return checkCardNumber(entityValues, debitCardNumberRegex)
}


/**
 * Added by Kore
 * **/
function isPrepaidCardNumber (entityValues) {
    const prepaidCardNumberRegex = /^(?:5211|5545|4569)/
    return checkCardNumber(entityValues, prepaidCardNumberRegex)
}



/**
 * Added by Kore
 * **/
function checkCardNumber (entityValues, cardRegex) {
    let regex = entityValues?.cardNumber || entityValues?.card
    return regex && (regex?.match(cardRegex))
}

/**
 * Added by Kore + belfius
 * **/



function fetchConfigParamValue(param) {
  try {
    return (
      BotUserSession.get('config')?.settings?.[param] ||
      BotUserSession.get('customVariables')?.[param] ||
      {
        channel: 'mobile',
        callCenterStatus: 'closed',
        userLoginStatus: 'loggedOut',
        env: 'PRD',
      }[param] || null
    );
  } catch (error) {
    console.error(`Error in fetchConfigParamValue: ${error.message}`);
    throw error;
  }
}





/**
 * Added by Kore
 * **/
const ageRangeValidator = (age, lowerLimit = 0, upperLimit) => {
    return age && age >= lowerLimit && age <= upperLimit
}


/**
 * Added by Kore
 * **/
const isSingleNumberEntered = (userInput) => userInput?.split(" ").length == 1 && !isNaN(parseInt(userInput))


/**
 * Added by Kore + Belfius 
 * **/
function fetchButtonTemplate(text = '', buttons = []) {
    try {
        const validTargets = new Set(['external', 'internal', 'lightbox']);

        const buttonValues = buttons.map(button => ({
            ...button,
            target: validTargets.has(button.target) ? button.target : 'internal'
        }));

        return {
            "type": "template",
            "payload": {
                "template_type": 'button',
                "button_type": 'button_rounded',
                "one_time_use": 0,
                "text": text,
                "buttons": buttonValues
            }
        };
    } catch (error) {
        koreDebugger.log('Error in the fetchButtonTemplate function: ' + error.message);
        return null;
    }
}



/**
 * Added by Kore
 * **/
function fetchTextTemplate (text) {
    return text;
}

/**
 * Added by Kore
 * **/
function fetchExitMsg (isCCOpen) {
    return isCCOpen ? "Exit1CCOpen" : "Exit1CCClosed"
}

/**
 * Added by Kore
 * **/
function checkIntent (intentName) {
    const successfulMainIntents = context.NLAnalysis.intents?.successIntents || [];
    const successfulSubIntents = context.NLAnalysis.subIntents?.successIntents || [];
    const successfulFollowUpIntents = context.FollowupIntents || [];
    const allIntents = [...successfulMainIntents, ...successfulSubIntents];

    const foundIntent = allIntents.filter(intent => {
        let key = currentLanguage == 'fr' ? 'intent' : 'intentName';
        return intent?.[key] === intentName;
    });

    if (foundIntent.length) {
        return foundIntent.length;
    } else {
        return successfulFollowUpIntents.filter(intent => intent == intentName).length
    }
}

/**
 * Added by Kore
 * **/
function calculateAge (dob) {
    dob = new Date(dob);
    var now = new Date();

    var yearsDiff = now.getFullYear() - dob.getFullYear();
    var monthsDiff = now.getMonth() - dob.getMonth();
    var daysDiff = now.getDate() - dob.getDate();

    // If the birthday hasn't occurred yet in the current year, subtract one year
    if (monthsDiff < 0 || (monthsDiff === 0 && daysDiff < 0)) {
        yearsDiff--;
    }

    return yearsDiff;
}

/**
 * Added by Kore
 * **/
function noIntentAndEntityFound () {
    return noIntentFound() && noEntityFound()
}

/**
 * Added by Kore
 * **/
function noIntentFound () {
    const successfulIntent = context.NLAnalysis.intents.successIntents
    return !successfulIntent?.length
}

/**
 * Added by Kore
 * **/
function emitCardRelatedSessionVariables () {
    BotUserSession.put('IsCard', entityValues?.isCardTrue)
    BotUserSession.put('isPrepaid', entityValues?.cardTypePrepaid)
    if (entityValues?.cardBrandMasterCard) BotUserSession.put('CardBrand', 'MasterCard')
    if (entityValues?.cardBrandVisa) BotUserSession.put('CardBrand', 'Visa')
}

/**
 * Added by Kore
 * **/
function noEntityFound () {
    const entityValues = findEntities()
    return !Object.keys(entityValues)?.length
}

/**
 * Added by Kore
 * **/
function isBelfiusIban (iban) {
    let bankCode = "", countryCode = "";
    let count = 0;
    for (let i = 0; i < iban.length; i++) {
        if (isNaN(parseInt(iban[i]))) {
            if (iban[i].match(/[a-zA-Z]/)) countryCode += iban[i];
            continue;
        }
        count++;
        if (count > 2 && count <= 5) bankCode += iban[i];
        if (count > 5) break;
    }
    if (countryCode != 'BE') return false;
    bankCode = parseInt(bankCode)
    

    const validBelfiusBankCodes = [50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 550, 551, 552, 553, 554, 555, 556, 557, 558, 559, 560, 562, 563, 564, 565, 566, 567, 568, 569, 624, 625, 638, 657, 672, 680, 682, 683, 775, 776, 777, 778, 779, 780, 781, 782, 783, 784, 785, 786, 787, 788, 789, 790, 791, 792, 793, 794, 795, 796, 797, 798, 799, 830, 831, 832, 833, 834, 835, 836, 837, 838, 839]

    return validBelfiusBankCodes.includes(bankCode)
}

/**
* Added by Kore
* **/
function emitPaymentTypeSessionVariables () {
    BotUserSession.put('IsOnline', (entityValues?.isOnline ? true : false));
    BotUserSession.put('IsAmount', (entityValues?.isAmountTrue ? true : false))
    BotUserSession.put('IsForeign', (entityValues?.isForeignTrue ? true : false));
    if (entityValues?.paymentTypeContactless) {
        BotUserSession.put('paymentType', 'Contactless')
    } if (entityValues?.brandApple) {
        BotUserSession.put('Brand', 'Apple');
    } if (entityValues?.itemTypePurchase) {
        BotUserSession.put('ItemType', 'Purchase');
    } if (entityValues?.itemTypePhone) {
        BotUserSession.put('ItemType', 'Phone');
    } if (entityValues?.itemTypePhone) {
        BotUserSession.put('ItemType', 'Iphone');
    } if (entityValues?.brandAmazon) {
        BotUserSession.put('Brand', 'Amazon');
    } if (entityValues?.paymentTypeBankTransfer) {
        BotUserSession.put('PaymentType', 'BankTransfer');
    } if (entityValues?.brandSamsung) {
        BotUserSession.put('Brand', 'Samsung');
    } if (entityValues?.paymentTypeApplepay) {
        BotUserSession.put('PaymentType', 'ApplePay');
    } if (entityValues?.brandGoogle) {
        BotUserSession.put('Brand', 'Google');
    } if (entityValues?.paymentTypeGooglepay) {
        BotUserSession.put('PaymentType', 'GooglePay');
    } if (entityValues?.paymentTypePayconiq) {
        BotUserSession.put('PaymentType', 'Payconiq');
    } if (entityValues?.paymentTypeQR) {
        BotUserSession.put('PaymentType', 'QR');
    } if (entityValues?.brandPaypal) {
        BotUserSession.put('Brand', 'Paypal');
    }
}

/**
* Added by Kore
* **/
function emitCardSessionVariables () {
    BotUserSession.put('IsCard', (entityValues?.isCardTrue ? true : false));
    BotUserSession.put('ColourRed', (entityValues?.colourRed ? true : false));
    BotUserSession.put('ColourGold', (entityValues?.colourGold ? true : false));
    BotUserSession.put('IsDebit', (entityValues?.isDebitTrue ? true : false));
    BotUserSession.put('IsPrepaid', (entityValues?.isPrepaidTrue ? true : false));
    BotUserSession.put('IsCredit', (entityValues?.isCreditTrue ? true : false));

    if (entityValues?.cardBrandVisa) {
        BotUserSession.put('CardBrand', 'Visa')
    } if (entityValues?.cardBrandMasterCard) {
        BotUserSession.put('CardBrand', 'MasterCard')
    } if (entityValues?.cardBrandBanContact) {
        BotUserSession.put('CardBrand', 'Bancontact')
    }
}
/**
 * Added by Kore
 * **/
function emitAccountSessionVariables () {
    BotUserSession.put('IsChecking', (entityValues?.isCheckingTrue ? true : false));
    BotUserSession.put('IsSaving', (entityValues?.isSavingTrue ? true : false));
    if (entityValues?.accountBrandBeats) {
        BotUserSession.put('AccountBrand', 'Beats')
    } if (entityValues?.accountBrandComfort) {
        BotUserSession.put('AccountBrand', 'Comfort')
    } if (entityValues?.accountBrandPulse) {
        BotUserSession.put('AccountBrand', 'Pulse')
    } if (entityValues?.accountBrandStar) {
        BotUserSession.put('AccountBrand', 'Star')
    } if (entityValues?.accountBrandNew) {
        BotUserSession.put('AccountBrand', 'New')
    }
}

/**
 * Added by Kore
 * **/
function findEntities (nerInfo = context.NLAnalysis?.intents?.nerInfo || {}) {
    // merging traits and botuserSessions as well
    const currentTraits = context.currentTraits
    const entityValues = { ...context.entities };
    const BotUserSessionValues = { ...context.session.BotUserSession.entities }
    for (const currentTrait of currentTraits) {
        entityValues[currentTrait] = true
    }

    for (const key in BotUserSessionValues) {
        if (BotUserSessionValues.hasOwnProperty(key)) {
            const value = BotUserSessionValues[key];
            entityValues[value] = true;
        }
    }

    for (const info of nerInfo) {
        entityValues[info.entityName] = currentLanguage == 'nl' ? info.value : info.Value //info.value is for NL and FR it will change info.Value
    }
    koreDebugger.log(`entityValues ${JSON.stringify(entityValues)}`)
    return entityValues
}


/**
 * Added by Belfius
 * Identifies the concepts that need to be resolved based on the provided flow concepts and entity values.
 *
 * @param {object} flowConcepts - The flow concepts to be processed (keys are already lowercased).
 * @param {object} entityValues - The entity values to be evaluated against the flow concepts (keys are already lowercased).
 * @returns {string[]} - An array containing the concepts that need to be resolved.
 */
function filterConceptsToResolve (flowConcepts, entityValues) {
    try {
        const conceptsToResolve = new Set();
        const entityKeys = Object.keys(entityValues);

        for (const concept of Object.keys(flowConcepts)) {
            const conceptValues = flowConcepts[concept].values.map(value => value.toLowerCase());
            if (conceptValues.some(value => entityKeys.includes(value))) {
                conceptsToResolve.add(concept);
            }
        }
        return Array.from(conceptsToResolve);
    } catch (error) {
        console.error('Error in filterConceptsToResolve: ', error.message);
        return [];
    }
}

/**
 * Added by Belfius
* Filters entities by confidence score and returns an object containing
* the entity names that meet the specified threshold.
*
* @param {object} nlAnalysis - The NL analysis object containing entity information.
* @param {number} threshold - The confidence score threshold (default is 0.80).
* @returns {object} - An object containing entity names that meet the threshold.
*/
function filterEntitiesByConfidence (threshold = 0.80) {
    try {
        const ner = context.NLAnalysis?.intents?.nerInfo || [];
        if (!ner) {
            return context.entities || {};
        }

        const filteredEntities = ner.filter(entityInfo =>
            Object.prototype.hasOwnProperty.call(entityInfo, 'entityName') &&
            Object.prototype.hasOwnProperty.call(entityInfo, 'entityNERConfidenceScore') &&
            typeof entityInfo.entityNERConfidenceScore === 'number' &&
            entityInfo.entityNERConfidenceScore >= threshold &&
            !['date', 'age', 'number'].includes(entityInfo.entityName) // Exclude specific entity names

        );

        const entityNames = context.entities || {};

        filteredEntities.forEach(entityInfo => {
            entityNames[entityInfo.entityName] = currentLanguage == 'nl' ? entityInfo.value : entityInfo.Value;
        });
        return entityNames;
    } catch (error) {
        koreDebugger.log('Error in filterEntitiesByConfidence: ' + error.message);
        throw error
    }
}




/**
 * Added by Belfius
 * Resolves concepts based on the provided array of concepts and conditions.
 * 
 * Note: The usage of functions in resolveConceptsFunctions is deprecating.
 * 
 * @param {string[]} conceptsToResolve - Array containing concepts to be resolved.
 * @param {object} resolveConceptsFunctions - Object containing resolve logic for each concept.
 * @param {object} entityValues - Object containing entity values.
 * @param {object} resultValues - Object to store processed results.
 * @returns {boolean} - Indicates whether any concept was resolved.
 */

/**
 * Resolves all concepts by executing functions or evaluating condition-action arrays.
 * Updates result values accordingly, attempting to resolve every concept.
 *
 * @param {string[]} conceptsToResolve - Array of concepts to be resolved.
 * @param {object} resolveConceptsFunctions - Object containing either functions or condition-action arrays.
 * @param {object} entityValues - Object containing entity values relevant to the resolution logic.
 * @param {object} resultValues - Object to store the results of the resolution.
 * @returns {boolean} - Indicates whether any concept was successfully resolved.
 */
const resolveConcepts = (conceptsToResolve, resolveConceptsFunctions, entityValues, resultValues) => {
    let conceptsResolved = false;

    for (const concept of conceptsToResolve) {
        const resolveLogic = resolveConceptsFunctions[concept];
        if (!resolveLogic) continue;

        if (typeof resolveLogic === 'function') {
            if (executeFunction(resolveLogic, entityValues, resultValues)) conceptsResolved = true;
        } else if (Array.isArray(resolveLogic)) {
            if (executeConditionActions(resolveLogic, entityValues, resultValues)) conceptsResolved = true;
        }
    }

    return conceptsResolved;
};

/**
 * Executes a resolve function, returns true if successful.
 *
 * @param {function} resolveFunction - The function to be executed.
 * @param {object} entityValues - Entity values for the function.
 * @param {object} resultValues - Object to store the results.
 * @returns {boolean} - True if function executes successfully.
 */
const executeFunction = (resolveFunction, entityValues, resultValues) => {
    try {
        return resolveFunction(entityValues, resultValues) !== false;
    } catch (error) {
        logError('error in executeFunction', error);
        return false;
    }
};

/**
 * Iterates over condition-action pairs, executing the first matching condition.
 *
 * @param {Array} conditionActions - Array of condition-action pairs.
 * @param {object} entityValues - Entity values for evaluating conditions.
 * @param {object} resultValues - Object to store the results.
 * @returns {boolean} - True if a condition-action pair is successfully executed.
 */
const executeConditionActions = (conditionActions, entityValues, resultValues) => {
    for (const { condition, action } of conditionActions) {
        try {
            const conditionMet = typeof condition === 'function' ? condition(entityValues, resultValues) : !!condition;
            if (conditionMet && typeof action === 'function') {
                action(resultValues);
                return true;
            }
        } catch (error) {
            logError('Error in executeConditionActions', error);
        }
    }
    return false;
};

/**
 * Logs an error message if in debug mode.
 *
 * @param {string} context - The context in which the error occurred.
 * @param {Error} error - The error object to log.
 */
const logError = (context, error) => isDebugMode() && koreDebugger.log(`${context}: ${error.message}`);


/*

 function resolveConcepts(conceptsToResolve, resolveConceptsFunctions, entityValues, resultValues) {
    try {

        conceptsToResolve.forEach(concept => {
            const resolveLogic = resolveConceptsFunctions[concept];
            if (typeof resolveLogic === 'function' || Array.isArray(resolveLogic)) {
                try {
                    if (typeof resolveLogic === 'function') {
                        const isExecuted = resolveLogic(entityValues, resultValues) == undefined ? true : resolveLogic(entityValues, resultValues);
                        if (isDebugMode()) koreDebugger.log(`isExecuted ${isExecuted}`);
                        if (isExecuted) {
                            conceptsResolved = true; // Set flag to true if function is executed
                        } else {
                            return false;
                        }

                    } else {
                //changes
                        if(isDebugMode()) koreDebugger.log(`resolve concepts resolving condtion arrays`)
                        for (const { condition, action } of resolveLogic) {
                            if (typeof condition !== 'function' && typeof condition !== 'boolean') {
                                if(isDebugMode()) koreDebugger.log(`Invalid condition: ${JSON.stringify(condition)}`);  
                                continue;
                            }

                            const conditionResult = typeof condition === 'function' ? condition(entityValues, resultValues) : condition;

                            if (conditionResult) {
                                if (typeof action === 'function') {
                                    action(resultValues);
                                    conceptsResolved = true;
                                    return true;
                                } else {
                                    if(isDebugMode()) koreDebugger.log(`Invalid action: ${JSON.stringify(action)}`);
                                    continue;
                                }
                            }
                        }
                    }
                // end of changes
                } catch (error) {
                    koreDebugger.log(`Error in '${concept}' resolveFunction: ` + error.message);
                    throw error;
                }
            }
        });
    } catch (error) {
        koreDebugger.log('An error occurred while resolving concepts:' + error.message);
        throw error;
    }
}

*/
/**
 * Added by Kore
 * This function is workaround for the issue https://support.kore.ai/hc/en-us/requests/40062
 * @param {Object} previousResultValues The previous state of the result
 * @param {Object} selectedResponses The parsed responses defined for the intent
 */

function showButtonTitleWorkaround (previousResultValues, selectedResponses, userInput) {
    let resultTitle;
    let previousNode;
    let previousObject;

    if(previousResultValues?.state?.value && previousResultValues?.stateCounter > 0){
        previousNode = previousResultValues?.state?.value + "reprompt" + previousResultValues?.stateCounter
    }

    koreDebugger.log(`previousNode value ${previousNode}`)

    previousObject = selectedResponses[previousNode]

    koreDebugger.log(`Previous Object ${JSON.stringify(previousObject)}`)
    koreDebugger.log(`UserInput ${userInput}`)

    const result = previousObject?.payload?.buttons?.filter(item => item?.payload == userInput)
    if(result){
        resultTitle = result[0].title
    }
    koreDebugger.log(`Result ${JSON.stringify(result)}`)
    koreDebugger.log(`ResultTitle ${resultTitle}`)
    tags.addAlternateText(resultTitle)

}




/**
 * Added by Kore + Belfius
 * Maps the user input to a button action and updates the result values accordingly.
 *
 * @param {string} userInput - The user input to be processed.
 * @param {object} buttonValues - The mapping of button numbers to result values.
 * @param {number} currentFlowNumber - The current flow number.
 * @param {object} resultValues - The object containing result values to be updated.
 * @returns {boolean} - Indicates whether the button input was processed.
 * 
 */
function resolveButtons(userInput, buttonValues, currentFlowNumber, resultValues, previousResultValues, selectedResponses) {
    try {
        if (!/^\[\d+-\d+\]$/.test(userInput.trim())) return false;

        const [flowNumber, buttonNumber] = userInput.slice(1, -1).split('-').map(Number);

        if (flowNumber !== currentFlowNumber) {
            resultValues.nextFlow = flowNumber;
            return true;
        }

        const buttonPayload = buttonValues[buttonNumber];
        if (!buttonPayload) {
            resultValues.nextFlow = 0;
            isDebugMode() && koreDebugger.log(`Missing payload for ${userInput}`);
            return true;
        }

        const updatedPayload = handleButtonWithAction(buttonPayload, context);

        if (updatedPayload.logicExecution) {
            delete updatedPayload.logicExecution
            for (let key in updatedPayload) {
            resultValues[key] = updatedPayload[key];
            }
            return false;
        }

        for (let key in updatedPayload) {
            resultValues[key] = updatedPayload[key];
        }
        return true;

    } catch (error) {
        koreDebugger.log("Error in resolveButtons function: " + error);
        throw error;
    }
}

/*
function resolveButtons (userInput, buttonValues, currentFlowNumber, resultValues,previousResultValues,selectedResponses) {
    try {        
        if(isButtonInput(userInput)) {
            showButtonTitleWorkaround(previousResultValues, selectedResponses, userInput)
            const payload = userInput.substring(1, userInput.length - 1); // Remove brackets
            const hyphenIndex = payload.indexOf('-');
            const flowNumber = parseInt(payload.substring(0, hyphenIndex), 10);
            const buttonNumber = parseInt(payload.substring(hyphenIndex + 1), 10);


            const isInactive = context?.flowOfOrigin?.inactiveButtons?.includes(userInput);
            if (isInactive) {
                delete context.flowOfOrigin
                return false;
            } else if (flowNumber === currentFlowNumber && buttonValues[buttonNumber]) {
                Object.entries(buttonValues[buttonNumber]).forEach(([key, val]) => {
                    resultValues[key] = val;
                });

            } else if (flowNumber === currentFlowNumber) {
                resultValues.nextFlow = 0
                if(isDebugMode()) koreDebugger.log(`Error in resolveButtons function: missing payload for ${JSON.stringify(userInput)}`)

            } else {
                resultValues.nextFlow = flowNumber
            }

            return true;
        }

        return false;
    } catch (error) {
        koreDebugger.log("Error in resolveButtons function: " + error);
        throw error;
    }
}
*/
/**
 * Added by Belfius
 * Processes button payloads with context actions. Executes the `contextAction` if present 
 * and removes it from the payload before returning the cleaned payload.
 *
 * @param {Object} buttonPayload - The payload to process.
 * @param {Object} context - The context to update based on the payload.
 * @returns {Object} - The cleaned payload, without `contextAction`.
 */
function handleButtonWithAction(buttonPayload, context) {
    if (buttonPayload.action) {
        buttonPayload.action(context);
        delete buttonPayload.action;
    }
    return buttonPayload;
}


/**
 * Added by Belfius
 * Checks if the user input matches the button input pattern.
 *
 * @param {string} userInput - The user input to be checked.
 * @returns {boolean} - Indicates whether the user input matches the button pattern.
 */
function isButtonInput (userInput) {
    const trimmedInput = userInput.trim();
    const pattern = /^\[\d+-\d+\]$/;
    return pattern.test(trimmedInput);
}



/**
 * Added by Belfius
 * Sets the isUpdated flag for each concept in the resultValues object based on changes compared to previousResultValues.
 *
 * @param {object} resultValues - The current result values.
 * @param {object} previousResultValues - The previous result values.
 */
function setUpdatedFlags(resultValues, previousResultValues) {
    try {
        for (const key in resultValues) {
            if (resultValues.hasOwnProperty(key)) {
                resultValues[key].isUpdated = (
                    resultValues[key]?.value != previousResultValues[key]?.value &&
                    String(resultValues[key]?.value).toLowerCase() !== String(previousResultValues[key]?.value).toLowerCase()
                );
            }
        }
    } catch (error) {
        koreDebugger.log(`Error in setUpdatedFlags function: ${error.message}`);
        throw error;
    }
}



/*
function setUpdatedFlags (resultValues, previousResultValues) {
    try {
        Object.keys(resultValues).forEach(key => {
            const currentValue = resultValues[key]?.value?.toLowerCase();
            const previousValue = previousResultValues[key]?.value?.toLowerCase();

            resultValues[key].isUpdated = currentValue !== previousValue;
        });
    } catch (error) {
        koreDebugger.log('Error in setUpdatedFlags function:', error);
        throw error;
    }
}
*/



/**
 * Added by Belfius + Kore
 * ResolveIntents contextual queries based on the selected intent and the provided resolve functions.
 *
 * @param {object} resultValues - The object containing result values to be updated.
 * @param {object} resolveIntentFunctions - An object containing resolve functions for each intent.
 * @param {number} currentFlowNumber - The current flow number.
 * @param {object} map - An object containing the flow number for each intent in the bot.
 * @returns {boolean} - Indicates whether any intent was called and resultValues were updated.
 */

function resolveIntents(resultValues, resolveIntentFunctions, currentFlowNumber, map) {
    try {
    const { intents: { successIntents = [] } = {}, subIntents: { successIntents: subSuccessIntents = [] } = {} } = context?.NLAnalysis || {};
    const [selectedIntent = 'not.understood'] = [...successIntents, ...subSuccessIntents]
        .map(intent => context.currentLanguage === 'nl' ? intent.intentName : intent.intent);
        if (isDebugMode()) koreDebugger.log(`selectedIntent ${selectedIntent}`);

        const { flowOfOrigin: { intentsInactive = [] } = {} } = context || {};

        if (intentsInactive.includes(map[selectedIntent]) || intentsInactive.includes(selectedIntent)) {
            if (isDebugMode()) koreDebugger.log(`Intent ${selectedIntent} is inactive. Returning false.`);
            delete context.flowOfOrigin?.intentsInactive;
            return false;
        }

        (resultValues.flowOfOrigin ||= { intentsInactive: [] }).intentsInactive.push(currentFlowNumber);

        const resolveLogic = resolveIntentFunctions[selectedIntent];
        if (resolveLogic) {
            const execLogic = logic => {
                if (typeof logic === 'function') {
                    const result = logic(resultValues);
                    return result !== false;
                }
                if (Array.isArray(logic)) {
                    return logic.some(({ condition, action }) => {
                        const conditionMet = typeof condition === 'function' ? condition(resultValues) : condition;
                        return conditionMet && typeof action === 'function' && action(resultValues) !== false;
                    });
                }
                return false;
            };
            if (execLogic(resolveLogic) === false) return false;
            return true;
        }

        return selectedIntent !== 'not.understood' && map[selectedIntent] !== currentFlowNumber
            ? !!(resultValues.nextFlow = map[selectedIntent] || 0)
            : false;

    } catch (error) {
        koreDebugger.log(`resolveIntents function error: ${error.message}`);
        throw error;
    }
}

/*


 function resolveIntents (resultValues, resolveIntentFunctions, currentFlowNumber, map) {
    try {
        const successIntents = [...(context?.NLAnalysis?.intents?.successIntents || []), ...(context?.NLAnalysis?.subIntents?.successIntents || [])];
        const selectedIntent = (currentLanguage == 'nl' ? successIntents[0]?.intentName : successIntents[0]?.intent) || 'not.understood';

        if(isDebugMode()) koreDebugger.log(`selectedIntent: ${JSON.stringify(selectedIntent)}`);


        const intentMap = map;

        if(isDebugMode()) koreDebugger.log(`context?.flowOfOrigin?.intentsInactive ${JSON.stringify(context?.flowOfOrigin?.intentsInactive)}`)

        if (context?.flowOfOrigin?.intentsInactive?.includes(intentMap[selectedIntent]) || context?.flowOfOrigin?.intentsInactive?.includes(selectedIntent)) {
            delete context.flowOfOrigin.intentsInactive;
            return false;
        }


        if(isDebugMode()) koreDebugger.log(`intentMap[selectedIntent] => '${intentMap[selectedIntent]}'`);

        if (!resultValues.flowOfOrigin || !Array.isArray(resultValues.flowOfOrigin.intentsInactive)) {
            resultValues.flowOfOrigin = resultValues.flowOfOrigin || {};
            resultValues.flowOfOrigin.intentsInactive = [];
        }
        resultValues.flowOfOrigin.intentsInactive.push(currentFlowNumber);


        const resolveLogic = resolveIntentsFunctions[selectedIntent];
        if (typeof resolveLogic === 'function' || Array.isArray(resolveLogic)) {
            try {
                if (typeof resolveLogic === 'function') {
                    const isExecuted = resolveLogic(resultValues) == undefined ? true : resolveLogic(resultValues); // Default values of true has been handled to for backward compatibilty
                    
                    if(isDebugMode()) koreDebugger.log(`isExecuted ${isExecuted}`);
                    
                    return isExecuted
                } else {
                    for (const { condition, action } of resolveLogic) {
                        if (typeof condition !== 'function' && typeof condition !== 'boolean') {
                            if(isDebugMode()) koreDebugger.log(`Invalid condition: ${JSON.stringify(condition)}`);
                            continue;
                        }

                        const conditionResult = typeof condition === 'function' ? condition(resultValues) : condition; 
                        
                        if (conditionResult) {
                            if (typeof action === 'function') {
                                action(resultValues);
                                return true;
                            } else {
                                if(isDebugMode()) koreDebugger.log(`Invalid action: ${JSON.stringify(action)}`);
                                continue;
                            }
                        }                   
                    }   
                } 
            } catch (error) {
                koreDebugger.log(`Error in '${selectedIntent}' resolve function: ${error.message}`);
                throw error;
            }
        }


        if(isDebugMode()) koreDebugger.log(`inside resolveIntents ${JSON.stringify(resultValues)}`)

        if (intentMap[selectedIntent] == currentFlowNumber || selectedIntent == 'not.understood') {
            return false;
        }

        if (selectedIntent != 'not.understood') resultValues.nextFlow = intentMap[selectedIntent] || 0;
        return true;
    } catch (error) {
        koreDebugger.log('resolveIntents function error: ' + error.message);
        throw error;
    }
}


*/





/**
 * Fetches the response based on the current state and state counter, and updates the state counter.
 *
 * @param {object} resultValues - The object containing result values.
 * @param {object} responses - An object containing response templates.
 * @param {number} repromptThreshold - The threshold value for reprompting.
 * @returns {string} - The fetched response.
 */
function fetchResponseAndUpdateCounter (resultValues, responses) {

    let counter = resultValues?.stateCounter || 0;
    let state = (resultValues?.state?.value || '').toLowerCase();

    if (resultValues?.state?.isUpdated) {
        counter = 0; // counter = 0
    } else {
        counter++
    }

    if (counter > 0 && state) {
        state += 'reprompt' + counter; // Concatenating the reprompt name
    }

    //if(isDebugMode()) koreDebugger.log(`inside fetchResponseAndUpdateCounter state ${state} resultValues ${JSON.stringify(resultValues)}`)


    // Increment the state counter in the resultValues
    resultValues.stateCounter = counter;
    resultValues.userPrompt = responses[state] || null;

}

// Helper function to return default intents map
function getDefaultIntentsMap () {
    return {
        'fallback': 0,
        'access': 1,
        'activate': 2,
        'add.money': 3,
        'become.client': 5,
        'block': 6,
        'broken': 7,
        'cancel.access': 8,
        'cancel.account': 9,
        'cancel.appointment': 10,
        'cancel.card': 11,
        'cancel.document': 12,
        'cancel.insurance': 13,
        'cancel.loan': 14,
        'cancel.payment': 15,
        'change.account': 16,
        'change.appointment': 17,
        'change.balance': 18,
        'change.card': 19,
        'change.code': 20,
        'change.insurance': 21,
        'change.language': 22,
        'change.limit': 23,
        'change.payment': 24,
        'change.personaldata': 25,
        'condolences': 26,
        'declined': 27,
        'dissatisfied': 30,
        'disconnected': 28,
        'dispute': 29,
        'expired': 31,
        'expiring': 32,
        'find.balance': 33,
        'find.code': 34,
        'find.contactdetails': 35,
        'find.document': 36,
        'find.limit': 37,
        'find.location': 38,
        'find.payment': 39,
        'find.price': 40,
        'find.requirements': 41,
        'find.time': 42,
        'forgotten': 43,
        'fraud': 44,
        'get.account': 45,
        'get.appointment': 46,
        'get.card': 47,
        'get.code': 48,
        'get.insurance': 49,
        'get.invest': 50,
        'get.loan': 51,
        'get.overdraft': 52,
        'goodbye': 53,
        'hello': 54,
        'help': 55,
        'info.card': 57,
        'info.account': 56,
        'info.insurance': 58,
        'insult': 59,
        'lost': 60,
        'make.claim': 61,
        'negative.access': 62,
        'negative.activate': 63,
        'negative.add.money': 64,
        'negative.card': 65,
        'negative.change.limit': 66,
        'negative.find.payment': 67,
        'negative.get.account': 68,
        'negative.get.appointment': 69,
        'negative.get.card': 70,
        'negative.help': 71,
        'Negative.order': 72,
        'negative.pay': 73,
        'negative.populate': 74,
        'negative.receive': 75,
        'negative.sign': 76,
        'negative.withdraw': 77,
        'no': 78,
        'overdrawn': 79,
        'pay': 80,
        'populate': 81,
        'redirect.customerteam': 82,
        'repaid': 83,
        'repay': 84,
        'sign': 85,
        'stolen': 86,
        'swallowed': 87,
        'thanks': 88,
        'unblock': 89,
        'unknown.contact': 90,
        'unknown.payment': 91,
        'whatcanyoudo': 92,
        'whoareyou': 93,
        'withdraw': 94,
        'wrong.payment': 95,
        'yes': 96,
        'yousuck': 97,
        'cancel.invest': 98,
        'info.invest': 99,
        'info.payment': 100,
        'event': 101,
        'wrong.delivery': 102
    };
}


/**
 * Merge values from session variables into the entityValues object based on the provided flowConcepts.
 *
 * @param {object} flowConcepts - An object containing concepts and their associated entity values.
 * @param {object} entityValues - The object containing entity values.
 */
function mergeEntitiesSessionValues (flowConcepts, entityValues) {
    try {
        // Get the entity values stored in session variables
        const sessionEntities = BotUserSession.get('entities') || [];

        // Merge session entity values into entityValues object based on flowConcepts
        for (const concept in flowConcepts) {
            const conceptValues = flowConcepts[concept];
            const isUnique = conceptValues.isUnique || false;

            if (isUnique) {
                // Check if none of the values are already present in entityValues
                if (conceptValues.values.every(value => !entityValues[value])) {
                    let variableStored = false;
                    conceptValues.values.forEach(value => {
                        if (!variableStored && sessionEntities.includes(value)) {
                            entityValues[value] = true;
                            variableStored = true;
                        }
                    });
                }
            } else {
                // Merge all values into entityValues without checking uniqueness
                conceptValues.values.forEach(value => {
                    if (sessionEntities.includes(value)) {
                        entityValues[value] = true;
                    }
                });
            }
        }
    } catch (error) {
        koreDebugger.log('Error in mergeSessionValues: ' + error.message);
        throw error;
    }
}



/**
 * Save the current flow name, user input, and intents to the customer journey in the BotUserSession.
 *
 * @param {string} currentFlowName - The name of the current flow.
 */
function saveCustomerJourney(currentFlowName) {
    try {
        const userInput = context?.NLAnalysis?.userInput || '';
        
        const successIntents = [
            ...(context?.NLAnalysis?.intents?.successIntents || []),
            ...(context?.NLAnalysis?.subIntents?.successIntents || [])
        ];
        const currentLanguage = context.currentLanguage;
        const selectedIntent = (currentLanguage === 'nl' ? successIntents[0]?.intentName : successIntents[0]?.intent) || 'not.understood';

        let customerJourney = BotUserSession.get('customerJourney') || { flows: [], queries: [], intents: [] };

        if (customerJourney.flows.length === 0 || customerJourney.flows[customerJourney.flows.length - 1] !== currentFlowName) {
            customerJourney.flows.push(currentFlowName);
        }

        if (userInput && (!customerJourney.queries.length || customerJourney.queries[customerJourney.queries.length - 1] !== userInput)) {
            customerJourney.queries.push(userInput);
        }

        if (!customerJourney.intents.length || customerJourney.intents[customerJourney.intents.length - 1] !== selectedIntent) {
            customerJourney.intents.push(selectedIntent);
        }

        BotUserSession.put('customerJourney', customerJourney);
    } catch (error) {
        koreDebugger.log('Error in saveCustomerJourney: ' + error.message);
        throw error;
    }
}


/**
 * Added by Belfius
 * Merges traits provided as input with the existing entity values.
 * Each trait in the array is added as a key in the entity values with a value of 'true'.
 *
 * @param {object} entityValues - The current entity values object.
 * @param {string[]} currentTraits - An array of traits to be merged with the entity values.
 * @returns {object} - The updated entity values object after merging traits.
 */
function mergeTraitsWithEntities (entityValues, currentTraits) {
    let updatedEntityValues = Object.assign({}, entityValues);

    if (Array.isArray(currentTraits)) {
        currentTraits.forEach(trait => {
            if (!updatedEntityValues.hasOwnProperty(trait)) {
                updatedEntityValues[trait] = 'true';
            }
        });
    }

    return updatedEntityValues;
}




/**
 * Manually add entities to the session entities array.
 *
 * @param {string[]} entities - An array of entities to add.
 */
function addToSessionEntities (entities) {
    try {
        const existingEntities = BotUserSession.get('entities') || [];

        entities.forEach(entity => {
            if (!existingEntities.includes(entity)) {
                existingEntities.push(entity);
            }
        });

        BotUserSession.put('entities', existingEntities);
    } catch (error) {
        koreDebugger.log('Error in addToSessionEntities: ' + error.message);
        throw error;
    }
}



/**
 * Added by Belfius
 * Remove values from BotUserSession's 'entities' array except those specified in entityList.
 *
 * @param {Array} entityList - List of entities to preserve.
 */
function removeEntitiesSessionValuesExcept (entityList = []) {
    try {
        const existingEntities = BotUserSession.get('entities') || [];

        const lowercasedEntityList = entityList.map(entity => entity.toLowerCase());
        const filteredEntities = existingEntities.filter(entity =>
            lowercasedEntityList.includes(entity.toLowerCase())
        );

        BotUserSession.put('entities', filteredEntities);
    } catch (error) {
        koreDebugger.log('Error in removeEntitiesSessionValuesExcept: ' + error.message);
        throw error;
    }
}




/**
 * Clear NLP context values by removing unnecessary variables.
 * @param {object} context - The context object containing variables to be cleared.
 */
function clearNlpContextValues (context) {
    try {
        delete context.NLAnalysis;
        delete context.entities;
        delete context.FollowupIntents;
    } catch (error) {
        koreDebugger.log('Error in clearNlpContextValues function: ' + error.message);
        throw error;
    }

}





/**
 * Added by Belfius + Kore
 * Prepares the user prompt based on the provided response and updates the context.
 * If the userPrompt is not valid, it directs to the fallback flow.
 *
 * @param {string|object|array} userPrompt - The user prompt to be prepared.
 * @returns {void} - This function does not return a value directly, but updates the context.
 */
function prepareUserPrompt (userPrompt = context.userPrompt) {
    if (userPrompt !== undefined) {
        if (Array.isArray(userPrompt)) {
            context.multipleMsg = userPrompt.length;
            context.userPrompt = userPrompt;
        }
        else if (userPrompt instanceof Object) {
            context.userPrompt = JSON.stringify(userPrompt);
        }
        else if (typeof userPrompt === 'string') {
            context.userPrompt = userPrompt;
        } else {
            koreDebugger.log(`Error in prepareUserPrompt: payload is not valid ${JSON.stringify(userPrompt)}`);
            throw error
        }
    } else {
        return;
    }
}


/**
 * Added by Belfius + Kore
 * Loads and flattens responses based on the provided call center status and channel.
 *
 * @param {object} responses - The responses object containing nested structures.
 * @param {string} [callCenterStatus] - The status of the call center (open or closed).
 * @param {string} [channel] - The channel (mobile or web).
 * @param {string} [userLoginStatus] - The Logged status (loggedIn or loggedOut).
 * @returns {object} - The flattened responses object.
 */
function loadResponses (responses, callCenterStatus = 'closed', channel = 'mobile', userLoginStatus = 'loggedIn') {
    try {
        let flattenedResponses = {};

        // Logic to flatten responses based on call center status
        if (callCenterStatus) {
            Object.entries(responses).forEach(([key, value]) => {
                if (typeof value === 'object' && value[callCenterStatus]) {
                    flattenedResponses[key] = value[callCenterStatus];
                } else {
                    flattenedResponses[key] = value;
                }
            });
        }

        // Logic to further flatten responses based on channel
        if (channel) {
            Object.entries(flattenedResponses).forEach(([key, value]) => {
                if (typeof value === 'object' && value[channel]) {
                    flattenedResponses[key] = value[channel];
                }
            });
        }

        //logic to further flatten responses based on channel
        if (userLoginStatus) {
            Object.entries(flattenedResponses).forEach(([key, value]) => {
                if (typeof value === 'object' && value[userLoginStatus]) {
                    flattenedResponses[key] = value[userLoginStatus];
                }
            });
        }

        return flattenedResponses;

    } catch (error) {
        koreDebugger.log('Error in removeAllValueExcept:', error);
        throw error;
    }
}



/**
 * Added by Belfius
 * Handles flow change based on the provided result values and entity values.
 *
 * @param {object} resultValues - The result values object.
 * @param {object} entityValues - The entity values object.
 * @returns {boolean} - True if flow change was processed successfully, false otherwise.
 */
 function handleFlowChange(resultValues ={}, entityValues ={}) {
     try {
        koreDebugger.log(`inside handleFlowChange ${JSON.stringify(resultValues)}`)
        if (resultValues.nextFlow) {
            // Add all keys of entityValues to session entities
            addToSessionEntities(Object.keys(entityValues));
            // Add valuestoSave to session entities if provided
            if (resultValues.valuestoSave) {
                addToSessionEntities(resultValues.valuestoSave);
            }
            // Update flowOfOrigin in context if provided
            if (resultValues.flowOfOrigin) {
                context.flowOfOrigin = resultValues.flowOfOrigin;
            }

            context.nextFlow = resultValues.nextFlow || '0';

            return true; // Flow change processed successfully
        }
        return false; // No flow change processed
    } catch (error) {
        koreDebugger.log('Error in handleFlowChange: ' + error.message);
        throw error;
    }
}

/**
 * Added by Kore + Belfius
 * Handles fallback scenarios based on the provided result values, previous result values, user prompt, and entity values.
 *
 * @param {object} resultValues - The result values object.
 * @param {object} previousResultValues - The previous result values object.
 * @param {object} entityValues - The entity values object.
 * @param {object} responses - The responses object.
 * @param {string[]} exitStates - An array of exit state values.
 * @returns {Boolean} - Boolean value indicating whether a fallback scenario is available.
 */
function handleFallback (resultValues, previousResultValues, responses, exitStates, entityValues = {}, defaultState = '') {
    try {
        // Check if there is no user prompt
        if (!resultValues.userPrompt) {
            // If the previous state was one of the specified exit states, set nextFlow and flowChange -> fallback flow
            if (exitStates.includes(previousResultValues?.state?.value)) {
                resultValues.state.value = 'flowChange'
                resultValues.nextFlow = '0'
                handleFlowChange(resultValues, entityValues);
                return false; // Exit function early to indicate we ran out of fallback scenarios
            }

            // Set default state if no previous state
            if (!previousResultValues?.state?.value) {
                if (defaultState === '') {
                    resultValues.nextFlow = '0';
                    handleFlowChange(resultValues, entityValues);
                } else {
                    resultValues.state = {value: defaultState,isUpdated: true};
                    resultValues.stateCounter = 0;
                    fetchResponseAndUpdateCounter(resultValues, responses);
                }

            } else {
                //Set exit state if previous state does exist indicating we ran out of prompts & reprompts
                resultValues.state = {value: 'exit1',isUpdated: true};
                resultValues.stateCounter = 0;
                fetchResponseAndUpdateCounter(resultValues, responses);
                setResultValueNullExcept(resultValues)
            }

        }

        return true;
    } catch (error) {
        // Handle any errors that occur
        koreDebugger.log('Error occurred while handling fallback:' + error);
        throw error;
    }
}



/**
 * Added by Belfius
 * Update result values based on conditions 
 * @param {object} resultValues - Object containing result values to be updated.
 * @param {object} previousResultValues - Object containing previous result values for comparison.
 * @param {object} entityValues - Object containing entity values.
 * @param {object} responses - Object containing responses.
 * @param {array} conditions - Array of condition-action pairs to evaluate.
 * @returns {boolean} - Indicates whether any condition was met and resultValues were updated.
 */
 function setStateValueBasedOnConditions(resultValues, previousResultValues, entityValues, responses, conditions) {
    try {

        // Extract values from resultValues
        const values = Object.entries(resultValues || {}).reduce((acc, [key, value]) => {
            acc[key] = value?.value || null;
            return acc;
        }, {});

        // Extract values from previousResultValues
        const previousValues = Object.entries(previousResultValues || {}).reduce((acc, [key, value]) => {
            acc[key] = value?.value || null;
            return acc;
        }, {});

        let conditionIsMet = false;
        // Iterate over the conditions and execute actions
        for (const { condition, action } of conditions) {
            if (condition(values, previousValues, entityValues)) {
                const result = action();
                // Check if the action returned a result for backward compatibility 
                if (result !== undefined) {
                    resultValues.state.value = result;
                }
                resultValues.state.isUpdated = resultValues.state.value !== previousValues.state;
                conditionIsMet = true;
                break;
            }
        }

        return conditionIsMet ? true : (resultValues.state = { value: previousValues?.state || null, isUpdated: false }, false);

    } catch (error) {
        koreDebugger.log('Error in setStateValueBasedOnConditions function: ' + error.message);
        throw error;
    }
}





/**
 * Added by Belfius
 * Execute the logic flow for handling user inputs, resolving intents, concepts, buttons, 
 * and updating session variables and context accordingly.
 *
 * @param {string[]} [currentTraits=[]] - Array of traits to be merged with the entity values.
 * @param {object} [flowConcepts={}] - Object containing concepts and their associated entity values.
 * @param {string} [userInput=''] - String representing the user input.
 * @param {object} [buttonValues={}] - Object containing button values.
 * @param {string} [currentFlowNumber=''] - Current flow number.
 * @param {object} [resultValues={}] - Object containing result values to be updated.
 * @param {object} [previousResultValues={}] - Object containing previous result values.
 * @param {object} [resolveIntentsFunctions={}] - Object containing condition-action paris to resolve intents.
 * @param {object} [resolveConceptsFunctions={}] - Object containing condition-action paris to resolve concepts.
 * @param {string[]} [exitStates=[]] - Array of exit states.
 * @param {object} [responses={}] - Object containing response templates.
 * @param {object[]} [conditions=[]] - Array of objects containing condition-action pairs to resolve the entity based conditional logic.
 * @param {string[]} [entityValuesToPreserve=[]] - An array of entity values to preserve in the bot user session.
 */

 function executeFlow({
    flowConcepts = {}, buttonValues = {}, currentFlowNumber = '', resultValues = {}, previousResultValues = {}, 
    resolveIntentsFunctions = {}, resolveConceptsFunctions = {}, exitStates = [], responses = {}, 
    conditions = [], entityValuesToPreserve = [], defaultState = ''
}) {
    try {
        // Data extraction and configuration
        const userInput = context?.NLAnalysis?.userInput ?? ''; 
        const currentTraits = context.currentTraits ?? [];
        const configParams = {};
        for (const param of ['callCenterStatus', 'channel', 'userLoginStatus']) {
            configParams[param] = FlowUtils.fetchConfigParamValue(param);
        }

        // Load and preprocess responses and resolve logic
        const selectedResponses = keysToLower(loadResponses(responses, configParams.callCenterStatus, configParams.channel, configParams.userLoginStatus));
        const intentsLogic = keysToLower(resolveIntentsFunctions);
        const conceptsLogic = keysToLower(resolveConceptsFunctions);

        // Merge and manage entities
        let entityValues = mergeTraitsWithEntities(filterEntitiesByConfidence(), currentTraits);
        mergeEntitiesSessionValues(flowConcepts, entityValues);
        removeEntitiesSessionValuesExcept(entityValuesToPreserve);

        if (isDebugMode()) koreDebugger.log(`Merged trait and entity values: ${JSON.stringify(entityValues,null,2)}`);

        // logic flags
        let buttonLogic = false, intentLogic = false, entityLogic = false;

        if (resolveButtons(userInput, buttonValues, currentFlowNumber, resultValues, previousResultValues, selectedResponses)) {
            buttonLogic = true;
            if (isDebugMode()) koreDebugger.log(`ResultValues after button logic: ${JSON.stringify(resultValues,null,2)}`);
        } else {
            resolveConcepts(filterConceptsToResolve(keysToLower(flowConcepts), keysToLower(entityValues)), conceptsLogic, entityValues, resultValues);
        }

        // Intent logic resolution
        if (!buttonLogic && resolveIntents(resultValues, intentsLogic, currentFlowNumber, getDefaultIntentsMap())) {
            intentLogic = true;
            if (isDebugMode()) koreDebugger.log(`ResultValues after intent logic: ${JSON.stringify(resultValues,null,2)}`);
        }

        // Entity logic resolution
        if (!buttonLogic && !intentLogic) {
            setStateValueBasedOnConditions(resultValues, previousResultValues, entityValues, selectedResponses, conditions);
            entityLogic = true;
            if (isDebugMode()) koreDebugger.log(`ResultValues after entity logic: ${JSON.stringify(resultValues,null,2)}`);
        }

        if (!buttonLogic) setUpdatedFlags(resultValues, previousResultValues);

        if (handleFlowChange(resultValues, entityValues)) return;

        fetchResponseAndUpdateCounter(resultValues, selectedResponses);

        handleFallback(resultValues, previousResultValues, selectedResponses, exitStates, entityValues, defaultState);

        // Clear result values if exit state encountered
        if (exitStates.includes(resultValues.state?.value)) {
            setResultValueNullExcept(resultValues);
        }

        // Debugging: Log final results
        if (isDebugMode()) {
            koreDebugger.log(`Final buttonLogic: ${buttonLogic}`);
            koreDebugger.log(`Final intentLogic: ${intentLogic}`);
            koreDebugger.log(`Final entityLogic: ${entityLogic}`);
            koreDebugger.log(`Final previousResultValues: ${JSON.stringify(previousResultValues,null,2).replace(/^{|}$/g, '').replace(/,/g, ',\n')}`);
            koreDebugger.log(`Final resultValues: ${JSON.stringify(resultValues,null,4)}`)
        }
        if (resultValues.userPrompt) prepareUserPrompt(resultValues.userPrompt);

        delete resultValues.userPrompt;
        context.resultValues = resultValues;
        clearNlpContextValues(context);
    } catch (error) {
        koreDebugger.log(`Error in executeFlow function: ${error.message}`);
        throw error;
    }
}

function isDebugMode() {
    return FlowUtils.fetchConfigParamValue('isDebugMode');
}


 /**
 * Maps the keys of an object to lowercase.
 *
 * @param {object} obj - The object whose keys are to be mapped to lowercase.
 * @returns {object} - The object with lowercase keys.
 */
function keysToLower(obj) {
    try {
        return Object.keys(obj).reduce((acc, key) => {
            if (obj.hasOwnProperty(key)) {
                acc[key.toLowerCase()] = obj[key];
            }
            return acc;
        }, {});
    } catch (error) {
    koreDebugger.log('Error in mapKeysToLower function: ' + error.message);
    throw error;
    }
}

/**
 * Class representing a CoveoHandler.
 * Handles API requests and responses for Coveo search platform.
 */
class CoveoHandler {
    static endpoints = {
        uat: "https://platform-eu.cloud.coveo.com/rest/search/v2?organizationId=belfiusbanknonproduction1x58i64xd",
        prd: "https://platform-eu.cloud.coveo.com/rest/search/v2?organizationId=belfiusbankproduction5y396w20"
    };
    
    static authorizationKeys = {
        uat: 'xx32b46197-14e5-41ae-8255-f98b4c29aca2',
        prd: 'xx86cf8823-601d-4043-a903-3713b6a72063'
    };


    static maxResults = 5;
    static isDebug = false;
    static domain = 'retail';
    static enableDidYouMean = true;
    static enableQuerySyntax = false;
    static searchHub = 'CovGenSearch';
    static enableDuplicateFiltering = true;

    static prepareApiRequest(environment, languageCode, userQuery) {
        if (!userQuery) return false;

        try {
            const isPrd = true; /* was: environment === 'prd'; */ // Forcing PRD due to issue with the non-PRD database
            const source = `${this.domain}_${languageCode}*`;
            const selfcareSource = `selfcarebelfius_${languageCode}*`;
            const anonymizedQuery = this.anonymizeSensitiveData(userQuery);
            const languageName = languageCode === 'fr' ? 'French' : languageCode === 'nl' ? 'Dutch' : 'Unknown'; 
            const advancedQuery = `(@language=${languageName}) ((@source=${source}) OR ((@source=${selfcareSource}) (@selfcarefilters=${this.domain})))`;

            const coveoRequestBody = {
                q: anonymizedQuery,
                aq: advancedQuery,
                searchHub: this.searchHub,
                enableQuerySyntax: this.enableQuerySyntax,
                enableDuplicateFiltering: this.enableDuplicateFiltering,
                locale: languageCode,
                enableDidYouMean: this.enableDidYouMean,
                numberOfResults: this.maxResults,
                debug: this.isDebug
            };
            const urlEncodedBody = Object.keys(coveoRequestBody)
                .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(coveoRequestBody[key])}`)
                .join('&');
            return {
                endpoint: isPrd ? this.endpoints.prd : this.endpoints.uat,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'Authorization': `Bearer ${isPrd ? this.authorizationKeys.prd : this.authorizationKeys.uat}`
                },
                body: JSON.stringify(urlEncodedBody)
            };
        } catch (error) {
            koreDebugger.log('Error in prepareApiRequest:', error.message);
            return false;
        }
    }

    static processApiResponse(coveoResponse, tags, channel) {
        const { totalCountFiltered, results } = coveoResponse?.body;

        if (totalCountFiltered === 0 || totalCountFiltered === 1) {
            return 'retry';
        } else {
            const message = results
                .map(({ title, clickUri }) => 
                    `* [${this.removeSuffixes(title)}](${this.setURLTags(clickUri, tags, channel)})`
                )
                .join('\n\n');

            return message;
        }
    }

    static removeSuffixes(title) {
        const suffixes = [
            ' - Belfius',
            ' - Service clients Belfius',
            ' - Moments-clés'
        ];
        
        let modifiedTitle = title;
        let suffixFound = true;

        while (suffixFound) {
            suffixFound = false;
            for (const suffix of suffixes) {
                if (modifiedTitle.endsWith(suffix)) {
                    modifiedTitle = modifiedTitle.substring(0, modifiedTitle.length - suffix.length);
                    suffixFound = true;
                }
            }
        }

        return modifiedTitle;
    }

    static detectAndFixEncoding(input) { //no longer necessery TBC 
        function isValidUtf8(str) {
            try {
                decodeURIComponent(escape(str));
                return true;
            } catch (error) {
                return false;
            }
        }

        let result = '';
        let i = 0;

        const misinterpretations = {
            'Ã€': 'À', 'Ã‚': 'Â', 'Ã„': 'Ä', 'Ã†': 'Æ', 'Ã‡': 'Ç', 'Ãˆ': 'È', 'Ã‰': 'É', 'ÃŠ': 'Ê', 'Ã‹': 'Ë',
            'ÃŒ': 'Ì', 'ÃŽ': 'Î', 'Ã‘': 'Ñ', 'Ã’': 'Ò', 'Ã“': 'Ó', 'Ã”': 'Ô', 'Ã•': 'Õ', 'Ã–': 'Ö', 'Ã™': 'Ù',
            'Ãš': 'Ú', 'Ã›': 'Û', 'Ãœ': 'Ü', 'ÃŸ': 'ß', 'Ã ': 'à ', 'Ã¡': 'á', 'Ã¢': 'â', 'Ã£': 'ã', 'Ã¤': 'ä',
            'Ã¥': 'å', 'Ã¦': 'æ', 'Ã§': 'ç', 'Ã¨': 'è', 'Ã©': 'é', 'Ãª': 'ê', 'Ã«': 'ë', 'Ã¬': 'ì', 'Ã­': 'í',
            'Ã®': 'î', 'Ã¯': 'ï', 'Ã°': 'ð', 'Ã±': 'ñ', 'Ã²': 'ò', 'Ã³': 'ó', 'Ã´': 'ô', 'Ãµ': 'õ', 'Ã¶': 'ö',
            'Ã·': '÷', 'Ã¸': 'ø', 'Ã¹': 'ù', 'Ãº': 'ú', 'Ã»': 'û', 'Ã¼': 'ü', 'Ã½': 'ý', 'Ã¾': 'þ', 'Ã¿': 'ÿ'
        };

        while (i < input.length) {
            let charCode = input.charCodeAt(i);

            if (charCode < 128) {
                // ASCII character
                result += input.charAt(i);
                i++;
            } else {
                // Detect and handle misinterpreted characters
                let misinterpretedChar = input.substr(i, 2);
                if (misinterpretations.hasOwnProperty(misinterpretedChar)) {
                    result += misinterpretations[misinterpretedChar];
                    i += 2;
                    continue;
                }

                // Try to decode as an UTF-8 sequence
                let sequence = '';
                let length = 0;

                if ((charCode & 0xE0) === 0xC0) {
                    // two-byte 
                    length = 2;
                } else if ((charCode & 0xF0) === 0xE0) {
                    // three-byte 
                    length = 3;
                } else if ((charCode & 0xF8) === 0xF0) {
                    // four-byte 
                    length = 4;
                }

                if (length > 0) {
                    sequence = input.substr(i, length);
                    if (isValidUtf8(sequence)) {
                        result += decodeURIComponent(escape(sequence));
                        i += length;
                        continue;
                    }
                }
                // Fallback to treating as single Latin-1 character
                result += String.fromCharCode(charCode & 0xFF);
                i++;
            }
        }

        return result;
    }

    static anonymizeSensitiveData(coveoQuery) {
        try {
            const email_regex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)(?<!\.)/gi;
            const numeric_regex = /[0-9]/g;

            return coveoQuery.replace(email_regex, '').replace(numeric_regex, '');
        } catch (error) {
            koreDebugger.log('Error in anonymizeSensitiveData:', error.message);
            throw error;
        }
    }

    static setURLTags(url, tags, channel) {
        const mobileQueryParam = "&bb_dest=in";
        const separator = url.includes('?') ? '&' : '?';

        const taggedUrl = Object.entries(tags).reduce((acc, [key, value], index) => {
            const tagSeparator = index === 0 && !url.includes('?') ? '?' : '&';
            return `${acc}${tagSeparator}${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
        }, url);
        return channel === 'mobile' ? `${taggedUrl}${mobileQueryParam}` : taggedUrl;
    }
}



/**
 * Class representing a ContactCenterHandler.
 * Handles API requests and responses for contact center availability check.
 */
class ContactCenterStatusHandler {
  static endpoints = {
    GTU: 'https://bot-gtu.b2b.belfius.be:8443/chatbot/contactcenteravailabilitycheck',
    UAT: 'https://bot-uat.b2b.belfius.be:8443/chatbot/contactcenteravailabilitycheck',
    PRD: 'https://bot.b2b.belfius.be:8443/chatbot/contactcenteravailabilitycheck'
  };

  static headers = {
    'Content-Type': 'application/json',
    'Request-ID': '0bccaad2-1515-42a6-9ad2-f8dfd28a0606',
    'Accept': 'application/vnd.belfius.api+json; version=1'
  };

  static prepareApiRequest(environment, language) {
    const endpoint = this.endpoints[environment];
    if (!endpoint) {
      koreDebugger.log(`Invalid environment: ${environment}`);
      return null;
    }

    return {
      endpoint,
      headers: { ...this.headers, 'Accept-Language': language },
      body: JSON.stringify({
        availability_check_request_id: "c717fdfc-3705-4392-a92b-c1014d1d0aab",
        availability_check_dialog_state_1: "5"
      })
    };
  }

  static getApiResult(contextObject) {
    const availability = context?.[contextObject]?.response?.body?.ContactCenterAvailability;
    return availability === "1" || availability === "2" ? "open" : "closed";
  }
}





class FlowUtils {
  static pickRandomKey(data, keyToRandomize, destinationKey) {
    const randomKey = Object.keys(data[keyToRandomize])[Math.random() * Object.keys(data[keyToRandomize]).length | 0];
    data[destinationKey] = data[keyToRandomize][randomKey];
    delete data[keyToRandomize];
    return data;
  }

  static fetchConfigParamValue(param) {
    try {
      return BotUserSession.get('config')?.settings?.[param] ||
             BotUserSession.get('customVariables')?.[param] ||
             { channel: 'mobile', callCenterStatus: 'closed', userLoginStatus: 'loggedOut', env: 'PRD'}[param] || 
             null;
    } catch (error) {
      koreDebugger.log(`Error in fetchConfigParamValue: ${error.message}`);
      throw error;
    }
  }
}



