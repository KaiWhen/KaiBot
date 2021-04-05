const numberWithCommas = x => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

const showZeroAsNA = x => {
    if (x == '0') return 'N/A';
    else return x;
};

module.exports = {
    numberWithCommas,
    showZeroAsNA
};