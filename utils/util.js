// utils/util.js

/**
 * 格式化日期
 * @param {Date|string|number} date
 * @param {string} fmt - 格式模板，如 'YYYY-MM-DD HH:mm'
 */
function formatDate(date, fmt = 'YYYY-MM-DD HH:mm') {
    if (!date) return '';
    if (typeof date === 'string' || typeof date === 'number') {
        date = new Date(date);
    }
    const o = {
        'M+': date.getMonth() + 1,
        'D+': date.getDate(),
        'H+': date.getHours(),
        'm+': date.getMinutes(),
        's+': date.getSeconds()
    };
    if (/(Y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for (let k in o) {
        if (new RegExp('(' + k + ')').test(fmt)) {
            fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length));
        }
    }
    return fmt;
}

/**
 * 手机号脱敏 138****8888
 */
function maskPhone(phone) {
    if (!phone || phone.length < 7) return phone || '';
    return phone.substring(0, 3) + '****' + phone.substring(phone.length - 4);
}

/**
 * 相对时间
 */
function relativeTime(dateStr) {
    if (!dateStr) return '';
    const now = new Date().getTime();
    const date = new Date(dateStr).getTime();
    const diff = now - date;

    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (diff < minute) return '刚刚';
    if (diff < hour) return Math.floor(diff / minute) + '分钟前';
    if (diff < day) return Math.floor(diff / hour) + '小时前';
    if (diff < 7 * day) return Math.floor(diff / day) + '天前';
    return formatDate(new Date(date), 'MM-DD HH:mm');
}

/**
 * 生成工单编号
 */
function generateOrderNo() {
    const now = new Date();
    const y = now.getFullYear();
    const m = ('0' + (now.getMonth() + 1)).slice(-2);
    const d = ('0' + now.getDate()).slice(-2);
    const r = ('0' + Math.floor(Math.random() * 100)).slice(-2);
    return 'RO-' + y + m + d + '-' + r;
}

/**
 * 节流函数
 */
function throttle(fn, delay = 500) {
    let timer = null;
    return function (...args) {
        if (timer) return;
        timer = setTimeout(() => {
            fn.apply(this, args);
            timer = null;
        }, delay);
    };
}

module.exports = {
    formatDate,
    maskPhone,
    relativeTime,
    generateOrderNo,
    throttle
};
