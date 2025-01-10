saveCustomerJourney('find.code')


const data = {
    topLevel1: fetchTextTemplate("Vous cherchez quel code ?"),
    topLevel1Reprompt1: fetchButtonTemplate(
        'Désolé, je me suis emmêlé les pinceaux. Vous voulez dire le:',
        [
            {
                "type": "postback",
                "title": "Code BIC/SWIFT",
                "payload": "[34-1]"
            },
            {
                "type": "postback",
                "title": "Code CVV/CVC",
                "payload": "[34-2]"
            },
            {
                "type": "postback",
                "title": "Code PIN",
                "payload": "[34-3]"
            },
            {
                "type": "postback",
                "title": "Nouveau chat",
                "payload": "[34-4]"
            }
        ]
    ),
    ifIban: fetchButtonTemplate(
        'Votre numéro IBAN se trouve sur votre carte Bancontact, commence par ‘BE’ et est composé de 14 chiffres. \n\nVous pouvez aussi le retrouver dans votre application Belfius, ici:',
        [
            {
                "type": "web_url",
                "title": "C’est parti !",
                "url": env.account_overview_url + "?" + env.accounts_cards_appkey
            }
        ]
    ),
    ifCardNumber: fetchTextTemplate("Votre numéro de carte de débit est inscrit dessus et est composé de 17 chriffres.\n\nCelui de votre carte de crédit est aussi inscrit dessus et compte 16 chiffres."),
    bicSwift1: [
        fetchTextTemplate("Le code BIC – SWIFT de Belfius est le GKCCBEBB."),
        fetchTextTemplate("N’hésitez pas si je peux faire autre chose pour vous :)")
    ],
    no: fetchTextTemplate("Pas de soucis. Je reste à votre disposition si besoin :)"),
    nodeCVVorCVC: fetchTextTemplate("Les cartes ne disposent pas toutes d’un code CVV/CVC. Est-ce que vous avez une carte de débit ou de crédit ?"),
    nodeCVVorCVCReprompt1: fetchButtonTemplate(
        'Désolé je me suis emmêlé les pinceaux. Vous voulez dire que c’est une:',
        [
            {
                "type": "postback",
                "title": "Bancontact",
                "payload": "[34-5]"
            },
            {
                "type": "postback",
                "title": "Mastercard/Visa",
                "payload": "[34-6]"
            }
        ]
    ),
    nodeMaestroorBancontact: fetchTextTemplate("Si vous avez reçu votre carte Bancontact après juin 2023, vous trouverez le code CVV/CVC à l’arrière de celle-ci.\n\nLes cartes Bancontact plus anciennes ne disposent pas de code CVV/CVC. Sachez que vous pouvez essayer d’utiliser les codes ‘OOO’, ‘999’ ou 111."),
    nodeMastercard: fetchTextTemplate("Le code CVV/CVC se trouve au dos de votre Mastercard et est composé de trois chiffres.\n\nSachez qu’il n’est visible que sur votre carte."),
    thanks: fetchTextTemplate("Avec plaisir. N’hésitez pas si vous avez besoin d’autre chose :)"),
    nodeSecretCode1: fetchButtonTemplate(
        'Il s’agit du code secret de votre:',
        [
            {
                "type": "postback",
                "title": "Carte",
                "payload": "[34-7]"
            },
            {
                "type": "postback",
                "title": "App",
                "payload": "[34-8]"
            }
        ]
    ),
    nodeSecretCode1Reprompt1: fetchTextTemplate("Désolé, je me suis emmêlé les pinceaux. Cliquez sur les boutons ci-dessus pour indiquer de quel code vous parlez."),
    nodeCard1: fetchButtonTemplate(
        'Par sécurité vos codes ne sont pas visibles dans votre espace client.\n\nSi vous ne vous souvenez plus de votre pin il faut aller en agence pour en avoir un nouveau:',
        [
            {
                "type": "web_url",
                "title": "Prendre rendez-vous",
                "url": env.make_appointment_logged_url + "?" + env.make_appointment_appkey
            }
        ]
    ),
    nodeAppCode: {
        open: {
            mobile: fetchTextTemplate("Par sécurité vos codes ne sont pas visibles dans votre espace client.\n\nSi vous ne vous en souvenez plus, cliquez sur “Code secret oublié” sous le pavé numérique de votre écran de connexion pour en choisir un nouveau."),
            web: fetchTextTemplate("Par sécurité vos codes ne sont pas visibles dans votre espace client.\n\nSi vous ne vous en souvenez plus, vous pouvez le réinitialiser en cliquant sur « Code secret oublié » dans votre app."),
        },
        closed: {
            mobile: fetchTextTemplate("Par sécurité vos codes ne sont pas visibles dans votre espace client.\n\nSi vous ne vous en souvenez plus, cliquez sur “Code secret oublié” sous le pavé numérique de votre écran de connexion pour en choisir un nouveau."),
            web: fetchTextTemplate("Par sécurité vos codes ne sont pas visibles dans votre espace client.\n\nSi vous ne vous en souvenez plus, vous pouvez le réinitialiser en cliquant sur « Code secret oublié » dans votre app."),
        }
    },
    itsMe1: fetchButtonTemplate(
        'Je ne connais pas bien Itsme. Vous retrouvez toutes les informations sur la page d’aide de leur site.',
        [
            {
                "type": "web_url",
                "title": "C’est parti !",
                "url": env.itsme_support_url
            }
        ]
    ),
    no1: fetchTextTemplate("D’accord. Est-ce que je peux faire autre chose pour vous ?"),
    no2: fetchTextTemplate("Pas de soucis. Je reste à votre disposition si besoin :)"),
    exit1: {
        open: {
            mobile: fetchButtonTemplate("Désolé, je me suis emmêlé les pinceaux. Reprenons depuis le début. Je vous écoute!", [{
                "type": "postback",
                "title": "Parler à quelqu’un",
                "payload": "[34-9]"
            }]),
            web: fetchButtonTemplate("Désolé, je me suis emmêlé les pinceaux. Reprenons depuis le début. Je vous écoute!", [{
                "type": "postback",
                "title": "Parler à quelqu’un",
                "payload": "[34-9]"
            }])
        },
        closed: fetchTextTemplate('Désolé, je me suis emmêlé les pinceaux. Reprenons depuis le début. Je vous écoute!')
    }
}



let entityValues = findEntities()
const exitStates = ['exit1'];
const defaultState = 'topLevel1'


const entityValuesToPreserve = [];
const channel = fetchConfigParamValue('channel')
const callCenterStatus = fetchConfigParamValue("callCenterStatus")
const responses = loadResponses(data, callCenterStatus, channel)
const currentFlowNumber = 34;

const flowConcepts = {
    iban: { values: ['identifierNumber', 'identifierIban'], isUnique: false },
    cardnumber: { values: ['identifierNumber'], isUnique: true },
    bicswift: { values: ['documentTypeBankIdentifier'], isUnique: true },
    cvvorcvc: { values: ['identifierCVV'], isUnique: true },
    secretcode: { values: ['identifierPIN'], isUnique: false },
    itsme: { values: ['interfaceTypeItsme'], isUnique: true },
    mastercard: { values: ['cardBrandMastercard', 'cardBrandVisa', 'isCreditTrue', 'isDebitTrue','isPrepaidTrue','colourGold'], isUnique: false },
    maestro: { values: ['cardBrandBancontact', 'cardBrandMaestro'], isUnique: false },
    card : { values: ['cardBrandBancontact', 'cardBrandMaestro', 'cardBrandMastercard', 'cardBrandVisa', 'isCreditTrue', 'isDebitTrue', 'isPrepaidTrue'], isUnique: false},
    cardCpt : { values: ['isCardTrue'], isUnique: false},
    app : { values: ['interfaceTypeApp'], isUnique: false},
    code :{ values:['isCodeTrue'], isUnique: false},
    debit: { values:['isDebitTrue'], isUnique: false},
    credit: { values:['isCreditTrue'], isUnique: false},
    mastercarddebit: { values: ['debitMastercard'], isUnique: false}
    
};

const buttonValues = {
    1: { 
        state: { value: "bicSwift1", isUpdated: true }, 
        iban: { value: null, isUpdated: false },
        cardnumber: { value: null, isUpdated: false },
        bicswift: { value: 'true', isUpdated: false },
        cvvorcvc: { value: null, isUpdated: false },
        secretcode: { value: null, isUpdated: false },
        itsme: { value: null, isUpdated: false },
        mastercard: { value: null, isUpdated: false },
        maestro: { value: null, isUpdated: false },
        card: { value: null, isUpdated: false },
        app: { value: null, isUpdated: false }
    },
    2: {
        state: { value: 'nodeCVVorCVC', isUpdated: true },
        iban: { value: null, isUpdated: false },
        cardnumber: { value: null, isUpdated: false },
        bicswift: { value: null, isUpdated: false },
        cvvorcvc: { value: 'true', isUpdated: false },
        secretcode: { value: null, isUpdated: false },
        itsme: { value: null, isUpdated: false },
        mastercard: { value: null, isUpdated: false },
        maestro: { value: null, isUpdated: false },
        card: { value: null, isUpdated: false },
        app: { value: null, isUpdated: false }
    },
    3: {
        state: { value: 'nodeSecretCode1', isUpdated: true },
        iban: { value: null, isUpdated: false },
        cardnumber: { value: null, isUpdated: false },
        bicswift: { value: null, isUpdated: false },
        cvvorcvc: { value: null, isUpdated: false },
        secretcode: { value: 'true', isUpdated: false },
        itsme: { value: null, isUpdated: false },
        mastercard: { value: null, isUpdated: false },
        maestro: { value: null, isUpdated: false },
        card: { value: null, isUpdated: false },
        app: { value: null, isUpdated: false }
    },
    4: {
        state: { value: 'exit1', isUpdated: true },
        iban: { value: null, isUpdated: false },
        cardnumber: { value: null, isUpdated: false },
        bicswift: { value: null, isUpdated: false },
        cvvorcvc: { value: null, isUpdated: false },
        secretcode: { value: null, isUpdated: false },
        itsme: { value: null, isUpdated: false },
        mastercard: { value: null, isUpdated: false },
        maestro: { value: null, isUpdated: false },
        card: { value: null, isUpdated: false },
        app: { value: null, isUpdated: false }
    },
    5: {
        state: { value: 'nodeMaestroorBancontact', isUpdated: true },
        iban: { value: null, isUpdated: false },
        cardnumber: { value: null, isUpdated: false },
        bicswift: { value: null, isUpdated: false },
        cvvorcvc: { value: null, isUpdated: false },
        secretcode: { value: null, isUpdated: false },
        itsme: { value: null, isUpdated: false },
        mastercard: { value: null, isUpdated: false },
        maestro: { value: 'true', isUpdated: false },
        card: { value: null, isUpdated: false },
        app: { value: null, isUpdated: false }
    },
    6: {
        state: { value: 'nodeMastercard', isUpdated: true },
        iban: { value: null, isUpdated: false },
        cardnumber: { value: null, isUpdated: false },
        bicswift: { value: null, isUpdated: false },
        cvvorcvc: { value: null, isUpdated: false },
        secretcode: { value: null, isUpdated: false },
        itsme: { value: null, isUpdated: false },
        mastercard: { value: 'true', isUpdated: false },
        maestro: { value: null, isUpdated: false },
        card: { value: null, isUpdated: false },
        app: { value: null, isUpdated: false }
    },
    7: {
        state: { value: 'nodeCard1', isUpdated: true },
        iban: { value: null, isUpdated: false },
        cardnumber: { value: null, isUpdated: false },
        bicswift: { value: null, isUpdated: false },
        cvvorcvc: { value: null, isUpdated: false },
        secretcode: { value: null, isUpdated: false },
        itsme: { value: null, isUpdated: false },
        mastercard: { value: null, isUpdated: false },
        maestro: { value: null, isUpdated: false },
        card: { value: 'true', isUpdated: false },
        app: { value: null, isUpdated: false }
    },
    8: {
        state: { value: 'nodeAppCode', isUpdated: true },
        iban: { value: null, isUpdated: false },
        cardnumber: { value: null, isUpdated: false },
        bicswift: { value: null, isUpdated: false },
        cvvorcvc: { value: null, isUpdated: false },
        secretcode: { value: null, isUpdated: false },
        itsme: { value: null, isUpdated: false },
        mastercard: { value: null, isUpdated: false },
        maestro: { value: null, isUpdated: false },
        card: { value: null, isUpdated: false },
        app: { value: 'true', isUpdated: false }
    },
    9: {
        state: { value: null, isUpdated: true },
        nextFlow: 82,
        flowOfOrigin: { inactiveButtons: [`[${currentFlowNumber}-9]`] },
        iban: { value: null, isUpdated: false },
        cardnumber: { value: null, isUpdated: false },
        bicswift: { value: null, isUpdated: false },
        cvvorcvc: { value: null, isUpdated: false },
        secretcode: { value: null, isUpdated: false },
        itsme: { value: null, isUpdated: false },
        mastercard: { value: null, isUpdated: false },
        maestro: { value: null, isUpdated: false },
        card: { value: null, isUpdated: false },
        app: { value: null, isUpdated: false }
    }
};

const previousResultValues = context.resultValues || {}

let resultValues = {
    state: { value: previousResultValues?.state?.value || null, isUpdated: false },
    iban: { value: previousResultValues?.iban?.value || null, isUpdated: false },
    cardnumber: { value: previousResultValues?.cardnumber?.value || null, isUpdated: false },
    bicswift: { value: previousResultValues?.bicswift?.value || null, isUpdated: false },
    cvvorcvc: { value: previousResultValues?.cvvorcvc?.value || null, isUpdated: false },
    secretcode: { value: previousResultValues?.secretcode?.value || null, isUpdated: false },
    itsme: { value: previousResultValues?.itsme?.value || null, isUpdated: false },
    mastercard : { value: previousResultValues?.mastercard?.value || null, isUpdated: false},
    maestro : { value: previousResultValues?.maestro?.value || null, isUpdated: false},
    card : { value: previousResultValues?.card?.value || null, isUpdated: false},
    code : { value: previousResultValues?.code?.value || null, isUpdated: false},
    debit :{ value: previousResultValues?.debit?.value || null, isUpdated: false},
    app : { value: previousResultValues?.app?.value || null, isUpdated: false},
    credit : { value: previousResultValues?.credit?.value || null, isUpdated: false},
    cardCpt : { value: previousResultValues?.cardCpt?.value || null, isUpdated: false},
    mastercarddebit : { value: previousResultValues?.mastercarddebit?.value || null, isUpdated: false},
    stateCounter: previousResultValues.stateCounter || 0,
};

const resolveConceptsFunctions = {
    iban: resolveIban,
    cardnumber: resolveCardNumber,
    bicswift: resolveBICSwift,
    cvvorcvc: resolveCVVorCVC,
    secretcode: resolveSecretCode,
    itsme: resolveItsme,
    mastercard: resolveMastercard,
    maestro: resolveMaestro,
    card : resolveCard,
    app : resolveApp,
    code : resolveCode,
    debit :resolveDebit,
    credit: resolveCredit,
    cardCpt: resolveCardCpt,
    mastercarddebit : resolveMasterCardDebit
}

const resolveIntentsFunctions = {
    'no': resolveNo,
    'thanks': resolveThanks,
    'negative.receive': resolveNegativeReceive,
    'negative.help': resolveNegativeHelp,
    'yousuck': resolveYousuck,
    'redirect.customerteam' :  resolveRedirectCustomerTeam,
    'not.understood': resolveNotUnderstood,
    'get.code' : resolveGetCode,
}

const conditions = [
    {
        condition: (values, previousValues) => ((previousValues.state == 'nodeCVVorCVC' || previousValues.state == 'nodeCVVorCVCReprompt1') && values.maestro),
        action: () => 'nodeMaestroorBancontact'
    },
    {
        condition: (values, previousValues) => ((previousValues.state == 'nodeCVVorCVC' || previousValues.state == 'nodeCVVorCVCReprompt1') && values.mastercarddebit),
        action: () => 'nodeMastercard'
    },
    {
        condition: (values, previousValues) => ((previousValues.state == 'nodeCVVorCVC' || previousValues.state == 'nodeCVVorCVCReprompt1') && values.debit),
        action: () => 'nodeCVVorCVCReprompt1'
    },
    {
        condition: (values, previousValues) => ((previousValues.state == 'nodeCVVorCVC' || previousValues.state == 'nodeCVVorCVCReprompt1') && values.mastercard),
        action: () => 'nodeMastercard'
    },
    {
        condition: (values, previousValues, entityValues) => ['topLevel1'].includes(previousValues.state) && resultValues.state.value == 0 && !Object.keys(entityValues).length,
        action: () => 'topLevel1Reprompt1'
    },
    {
        condition: (values, previousValues, entityValues) => ['nodeSecretCode1', 'nodeSecretCode1Reprompt1'].includes(previousValues.state) && !Object.keys(entityValues).length ,
        action: () => 'nodeSecretCode1Reprompt1'
    },
    {
        condition: (values, previousValues) => ['nodeSecretCode1', 'nodeSecretCode1Reprompt1'].includes(previousValues.state) && values.app ,
        action: () => 'nodeAppCode'
    },
    {
        condition: (values, previousValues) => (['nodeSecretCode1', 'nodeSecretCode1Reprompt1'].includes(previousValues.state) && (values.card || values.cardCpt)),
        action: () => 'nodeCard1'
    },
    {
        condition: (values, previousValues, entityValues) => ['nodeSecretCode1'].includes(previousValues.state) && values.secretcode && values.code && resultValues.stateCounter == '0' ,
        action: () => 'nodeSecretCode1Reprompt1'
    },
    {
        condition: (values, previousValues) => values.credit && values.code && previousValues.state == null,
        action: () => 'topLevel1'
    },
    {
        condition: (values, previousValues) => values.bicswift,
        action: () => 'bicSwift1'
    },
    {
        condition: (values, previousValues) => values.cvvorcvc,
        action: () => 'nodeCVVorCVC'
    },
    {
        condition: (values, previousValues, entityValues) => values.secretcode,
        action: () => 'nodeSecretCode1'
    },
    {
        condition: (values, previousValues) => values.itsme,
        action: () => 'itsMe1'
    },
    {
        condition: (values, previousValues) => ['topLevel1', 'topLevel1Reprompt1'].includes(previousValues.state) && values.cardnumber,
        action: () => 'ifCardNumber'
    },
    {
        condition: (values, previousValues) => values.cardnumber && (values.card || values.cardCpt || values.credit),
        action: () => 'ifCardNumber'
    },
    {
        condition: (values, previousValues) => values.iban,
        action: () => 'ifIban'
    },
    {
        condition: (values, previousValues) => values.app,
        action: () => 'nodeSecretCode1'
    },
    {
        condition: (values, previousValues) => values.cardnumber,
        action: () => 'ifCardNumber'
    },
];


function resolveMasterCardDebit(entityValues, resultValues) {
    try {
        koreDebugger.log('mastercarddebit is called...')
        const conditions = [
            {
                condition: true,
                action: () => {
                    resultValues.mastercarddebit.value = 'true';
                }
            },
        ];

        for (const { condition, action } of conditions) {
            if (condition) {
                action();
                return;
            }
        }
    } catch (error) {
        koreDebugger.log('Error in mastercarddebit: ' + error);
        throw error;
    }
}

function resolveCardCpt(entityValues, resultValues) {
    try {
        koreDebugger.log('cardCpt is called...')
        const conditions = [
            {
                condition: true,
                action: () => {
                    resultValues.cardCpt.value = 'true';
                }
            },
        ];

        for (const { condition, action } of conditions) {
            if (condition) {
                action();
                return;
            }
        }
    } catch (error) {
        koreDebugger.log('Error in cardCpt: ' + error);
        throw error;
    }
}

function resolveIban(entityValues, resultValues) {
    try {
        koreDebugger.log('resolveIban is called...')
        const conditions = [
            {
                condition: true,
                action: () => {
                    resultValues.iban.value = 'true';
                }
            },
        ];

        for (const { condition, action } of conditions) {
            if (condition) {
                action();
                return;
            }
        }
    } catch (error) {
        koreDebugger.log('Error in resolveIban: ' + error);
        throw error;
    }
}

function resolveMastercard(entityValues, resultValues) {
    try {
        koreDebugger.log('resolveMastercard is called...')
        const conditions = [
            {
                condition: true,
                action: () => {
                    resultValues.mastercard.value = 'true';
                }
            },
        ];

        for (const { condition, action } of conditions) {
            if (condition) {
                action();
                return;
            }
        }
    } catch (error) {
        koreDebugger.log('Error in resolveIMaestro: ' + error);
        throw error;
    }
}

function resolveMaestro(entityValues, resultValues) {
    try {
        koreDebugger.log('resolveMaestro is called...')
        const conditions = [
            {
                condition: true,
                action: () => {
                    resultValues.maestro.value = 'true';
                }
            },
        ];

        for (const { condition, action } of conditions) {
            if (condition) {
                action();
                return;
            }
        }
    } catch (error) {
        koreDebugger.log('Error in resolveMaestro: ' + error);
        throw error;
    }
}

function resolveCard(entityValues, resultValues) {
    try {
        koreDebugger.log('resolveCard is called...')
        const conditions = [
            {
                condition: true,
                action: () => {
                    resultValues.card.value = 'true';
                },
            },
        ];

        for (const { condition, action } of conditions) {
            if (condition) {
                action();
                return;
            }
        }
    } catch (error) {
        koreDebugger.log('Error in resolveCard: ' + error);
        throw error;
    }
}

function resolveCode(entityValues, resultValues) {
    try {
        koreDebugger.log('resolveCode is called...')
        const conditions = [
            {
                condition: true,
                action: () => {
                    resultValues.code.value = 'true';
                },
            },
        ];

        for (const { condition, action } of conditions) {
            if (condition) {
                action();
                return;
            }
        }
    } catch (error) {
        koreDebugger.log('Error in resolveCard: ' + error);
        throw error;
    }
}
function resolveApp(entityValues, resultValues) {
    try {
        koreDebugger.log('resolveApp is called...')
        const conditions = [
            {
                condition: true,
                action: () => {
                    resultValues.app.value = 'true';
                }
            },
        ];

        for (const { condition, action } of conditions) {
            if (condition) {
                action();
                return;
            }
        }
    } catch (error) {
        koreDebugger.log('Error in resolveApp: ' + error);
        throw error;
    }
}

function resolveCardNumber(entityValues, resultValues) {
    try {
        koreDebugger.log('resolvecardNumber is called...')
        const conditions = [
            {
                condition: true,
                action: () => {
                    resultValues.cardnumber.value = 'true';
                }
            },
        ];

        for (const { condition, action } of conditions) {
            if (condition) {
                action();
                return;
            }
        }
    } catch (error) {
        koreDebugger.log('Error in resolvecardNumber: ' + error);
        throw error;
    }
}
function resolveDebit(entityValues, resultValues) {
    try {
        koreDebugger.log('resolveDebit is called...')
        const conditions = [
            {
                condition: true,
                action: () => {
                    resultValues.debit.value = 'true';
                }
            },
        ];

        for (const { condition, action } of conditions) {
            if (condition) {
                action();
                return;
            }
        }
    } catch (error) {
        koreDebugger.log('Error in resolvecardNumber: ' + error);
        throw error;
    }
}
function resolveCredit(entityValues, resultValues) {
    try {
        koreDebugger.log('resolveCredit is called...')
        const conditions = [
            {
                condition: true,
                action: () => {
                    resultValues.credit.value = 'true';
                }
            },
        ];

        for (const { condition, action } of conditions) {
            if (condition) {
                action();
                return;
            }
        }
    } catch (error) {
        koreDebugger.log('Error in resolveCredit: ' + error);
        throw error;
    }
}
function resolveBICSwift(entityValues, resultValues) {
    try {
        koreDebugger.log('resolvebicswift is called...')
        const conditions = [
            {
                condition: true,
                action: () => {
                    resultValues.bicswift.value = 'true';
                }
            },
        ];

        for (const { condition, action } of conditions) {
            if (condition) {
                action();
                return;
            }
        }
    } catch (error) {
        koreDebugger.log('Error in resolvebicswift: ' + error);
        throw error;
    }
}

function resolveCVVorCVC(entityValues, resultValues) {
    try {
        koreDebugger.log('resolvecvvorcvc is called...')
        const conditions = [
            {
                condition: true,
                action: () => {
                    resultValues.cvvorcvc.value = 'true';
                },
            },
            
        ];

        for (const { condition, action } of conditions) {
            if (condition) {
                action();
                return;
            }
        }
    } catch (error) {
        koreDebugger.log('Error in resolvecvvorcvc: ' + error);
        throw error;
    }
}

function resolveSecretCode(entityValues, resultValues) {
    try {
        koreDebugger.log('resolvesecretcode is called...')
        const conditions = [
            {
                condition: true,
                action: () => {
                    resultValues.secretcode.value = 'true';
                }
            },
        ];

        for (const { condition, action } of conditions) {
            if (condition) {
                action();
                return;
            }
        }
    } catch (error) {
        koreDebugger.log('Error in resolvesecretcode: ' + error);
        throw error;
    }
}

function resolveItsme(entityValues, resultValues) {
    try {
        koreDebugger.log('resolveitsme is called...')
        const conditions = [
            {
                condition: true,
                action: () => {
                    resultValues.itsme.value = 'true';
                }
            },
        ];

        for (const { condition, action } of conditions) {
            if (condition) {
                action();
                return;
            }
        }
    } catch (error) {
        koreDebugger.log('Error in resolveitsme: ' + error);
        throw error;
    }
}

function resolveNegativeReceive(resultValues) {
    try {
        koreDebugger.log(`resolveNegativeReceive is called`);

        const conditions = [
            {
                condition: true,
                action: () => {
                    resultValues.valuestoSave = ['identifierPIN'];
                    resultValues.nextFlow = '75';
                }
            },
        ];

        for (const { condition, action } of conditions) {
            if (condition) {
                action();
                return;
            }
        }
    } catch (error) {
        koreDebugger.log('Error in resolveNegativeReceive: ' + error);
        throw error;
    }
}

function resolveNo(resultValues) {
    try {
        const conditions = [
            {
                condition: resultValues.state?.value == 'bicSwift1',
                action: () => {
                    resultValues.state.value = 'no';
                }
            },
            {
                condition: resultValues.state?.value == 'itsMe1',
                action: () => {
                    resultValues.state.value = 'no1'
                }
            },
        ];

        for (const { condition, action } of conditions) {
            if (condition) {
                action();
                return;
            }
        }
        return false
    } catch (error) {
        koreDebugger.log('Error in resolveNo: ' + error);
        throw error;
    }
}

function resolveThanks(resultValues) {
    try {
        const conditions = [
            {
                condition: resultValues.state?.value == 'nodeMaestroorBancontact' || resultValues.state?.value == 'nodeMastercard' ,
                action: () => {
                    resultValues.state.value = 'thanks';
                }
            },
            {
                condition: true,
                action: () => {
                    resultValues.nextFlow = '88';
                }
            },
        ];

        for (const { condition, action } of conditions) {
            if (condition) {
                action();
                return;
            }
        }
    } catch (error) {
        koreDebugger.log('Error in resolveThanks: ' + error);
        throw error;
    }
}

function resolveNegativeHelp(resultValues) {
    try {
        const conditions = [
            {
                condition: resultValues.state?.value == 'exit1',
                action: () => {
                    resultValues.nextFlow = '82';
                }
            },
            {
                condition: resultValues.state?.value != null,
                action: () => {
                    resultValues.state.value = 'exit1'
                    koreDebugger.log("negative.help")
                }
            }
        ];

        for (const { condition, action } of conditions) {
            if (condition) {
                action();
                return;
            }
        }
    } catch (error) {
        koreDebugger.log('Error in resolveNegativeHelp: ' + error);
        throw error;
    }
}

function resolveYousuck(resultValues) {
    try {
        const conditions = [
            {
                condition: resultValues.state?.value == 'exit1',
                action: () => {
                    resultValues.nextFlow = '82';
                }
            },
            {
                condition: resultValues.state?.value != null,
                action: () => {
                    resultValues.state.value = 'exit1'
                }
            }
        ];

        for (const { condition, action } of conditions) {
            if (condition) {
                action();
                return;
            }
        }
    } catch (error) {
        koreDebugger.log('Error in resolveYousuck: ' + error);
        throw error;
    }
}

function resolveRedirectCustomerTeam(resultValues){
    try {
        const conditions = [
            {
                condition: true,
                action: () => {
                    resultValues.nextFlow = '82';
                }
            },
        ];

        for (const { condition, action } of conditions) {
            if (condition) {
                action();
                return;
            }
        }
    } catch (error) {
        koreDebugger.log('Error in resolveYousuck: ' + error);
        throw error;
    }
}

function resolveGetCode(resultValues){
    try {
        const conditions = [
            {
                condition: resultValues.state.value == null,
                action: () => {
                    resultValues.state.value = 'topLevel1';
                }
            },
        ];

        for (const { condition, action } of conditions) {
            if (condition) {
                action();
                return;
            }
        }
        return false
    } catch (error) {
        koreDebugger.log('Error in resolveYousuck: ' + error);
        throw error;
    }
}

function resolveNotUnderstood(resultValues) {
    try {
        const conditions = [
            {
                condition: resultValues.state.value=='nodeSecretCode1' && resultValues.stateCounter==0 && entityValues.length==0,
                action: () => {
                    resultValues.state?.value == 'nodeSecretCode1Reprompt1';
                }
            }
        ];

        for (const { condition, action } of conditions) {
            if (condition) {
                action();
                return;
            }
            return false;
            
        }
    return false
    } catch (error) {
        koreDebugger.log('Error in resolveNotUnderstood: ' + error);
        throw error;
    }
}

executeFlow({flowConcepts, buttonValues, currentFlowNumber, resultValues, previousResultValues, resolveIntentsFunctions, resolveConceptsFunctions, exitStates, responses, conditions, entityValuesToPreserve, defaultState})