
function make_calculation_text(params){
    let pf1 = parseFloat(params.n1);
    let pf3 = parseFloat(params.n3);
    let pf2 = null;

    console.log(params);

    switch(params.n2){
        case '+':
        case '-':
        case '×':
        case '÷':
        case '%':
            pf2 = params.n2;
    }

    if(pf1 == NaN || pf3 == NaN || !pf2){
        return "そのけいさんはできないよ";
    }


    let ans = 0;
    let ans_2 = 0;
    switch(pf2){
        case '+':
            ans = pf1 + pf3;
            return `${pf1}、たす、${pf3}、のこたえは、${ans}、だよ`;
        case '-':
            ans = pf1 - pf3;
            return `${pf1}、ひく、${pf3}、のこたえは、${ans}、だよ`;
        case '×':
            ans = pf1 * pf3;
            return `${pf1}、かける、${pf3}、のこたえは、${ans}、だよ`;
        case '÷':
            ans = pf1 / pf3;
            return `${pf1}、わる、${pf3}、のこたえは、${ans}、だよ`;
        case '%':
            ans =  Math.floor(pf1 / pf3);
            ans_2 =  pf1 % pf3;
            if(ans_2 == 0) return `${pf1}、わる、${pf3}、のこたえは、${ans}、だよ`;
            else return `${pf1}、わる、${pf3}、のこたえは、${ans}、あまり、${ans_2}、だよ`;
    }

    return 'エラー';

}

exports.make_calculation_text = make_calculation_text;