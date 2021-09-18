function checkAuthenticated (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
};

function checkNotAuthenticated (req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/home');
    }
    next();
};

const log_out = (req, res) => {
    req.logOut();
    res.redirect('/');
};

module.exports = {
    checkAuthenticated,
    checkNotAuthenticated,
    log_out
}