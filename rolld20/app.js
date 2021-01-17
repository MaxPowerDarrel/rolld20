const qs = require('querystring')

const validRollRegex = /^\dd\d{1,2}$/g;
const isValidRoll = (rollCommand) => rollCommand && validRollRegex.test(rollCommand);
const isBill = (user) => user && user.includes('U01G0L10GTE');
const parseRoll = (rollCommand) => {
    const d = rollCommand.indexOf('d');
    const numberOfDice = rollCommand.substring(0, d);
    const sides = rollCommand.substring(d + 1);
    return [numberOfDice, sides];
}

const rollDie = (user, sides) => {
    if(isBill(user))
        return 7;
    else return Math.floor(Math.random() * sides) + 1;
}

const roll = (user, rollCommand) => {
    if(isValidRoll(rollCommand)) {
        const [numberOfDice, sides] = parseRoll(rollCommand);
        const rolls = [];
        for (let i = 0; i < numberOfDice; i++) {
            rolls.push(rollDie(user, sides))
        }
        return rolls;
    }
    return null;
}

exports.lambdaHandler = async (event) => {
    try {
        const request = qs.parse(event.body);
        console.log("request: ", request);
        const results = roll(request.user_id, request.text)
        return  {
            'statusCode': 200,
            'body': JSON.stringify({
                text: `<@${request.user_id}> rolled ${results.join(' ')}` || 'Please format the request in the form of /roll 2d6',
                response_type: results ? 'in_channel' : 'ephemeral'
            })
        }
    } catch (err) {
        console.log(err);
        return  {
            'statusCode': 200,
            'body': JSON.stringify({
                text: 'Please format the request in the form of /roll 2d6',
                response_type: 'ephemeral'
            })
        }
    }
};
