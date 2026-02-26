// utils/request.js
const { BASE_URL } = require('./constants');

/**
 * 封装 wx.request
 * @param {string} url - 请求路径（不含 BASE_URL）
 * @param {string} method - HTTP 方法
 * @param {object} data - 请求数据
 * @param {boolean} showLoading - 是否显示加载
 */
function request(url, method = 'GET', data = {}, showLoading = true) {
    return new Promise((resolve, reject) => {
        if (showLoading) {
            wx.showLoading({ title: '加载中...', mask: true });
        }

        const token = wx.getStorageSync('token');
        const header = {
            'Content-Type': 'application/json'
        };
        if (token) {
            header['Authorization'] = 'Bearer ' + token;
        }

        wx.request({
            url: BASE_URL + url,
            method: method,
            data: data,
            header: header,
            success(res) {
                if (showLoading) wx.hideLoading();

                if (res.statusCode === 200) {
                    const body = res.data;
                    if (body.code === 200 || body.code === 0) {
                        resolve(body.data);
                    } else {
                        wx.showToast({ title: body.message || '请求失败', icon: 'none' });
                        reject(body);
                    }
                } else if (res.statusCode === 401) {
                    // Token 过期或未登录
                    wx.removeStorageSync('token');
                    wx.removeStorageSync('userInfo');
                    const app = getApp();
                    if (app) {
                        app.globalData.isLoggedIn = false;
                        app.globalData.token = '';
                        app.globalData.userInfo = null;
                    }
                    wx.showToast({ title: '登录已过期，请重新登录', icon: 'none' });
                    setTimeout(() => {
                        wx.navigateTo({ url: '/pages/login/login' });
                    }, 1500);
                    reject(res);
                } else {
                    wx.showToast({ title: '网络错误: ' + res.statusCode, icon: 'none' });
                    reject(res);
                }
            },
            fail(err) {
                if (showLoading) wx.hideLoading();
                wx.showToast({ title: '网络连接失败', icon: 'none' });
                reject(err);
            }
        });
    });
}

function get(url, data = {}, showLoading = true) {
    return request(url, 'GET', data, showLoading);
}

function post(url, data = {}, showLoading = true) {
    return request(url, 'POST', data, showLoading);
}

function put(url, data = {}, showLoading = true) {
    return request(url, 'PUT', data, showLoading);
}

function del(url, data = {}, showLoading = true) {
    return request(url, 'DELETE', data, showLoading);
}

/**
 * 文件上传
 */
function uploadFile(url, filePath, name = 'file') {
    return new Promise((resolve, reject) => {
        wx.showLoading({ title: '上传中...', mask: true });
        const token = wx.getStorageSync('token');

        wx.uploadFile({
            url: BASE_URL + url,
            filePath: filePath,
            name: name,
            header: {
                'Authorization': token ? 'Bearer ' + token : ''
            },
            success(res) {
                wx.hideLoading();
                if (res.statusCode === 200) {
                    const data = JSON.parse(res.data);
                    if (data.code === 200 || data.code === 0) {
                        resolve(data.data);
                    } else {
                        wx.showToast({ title: data.message || '上传失败', icon: 'none' });
                        reject(data);
                    }
                } else {
                    wx.showToast({ title: '上传失败', icon: 'none' });
                    reject(res);
                }
            },
            fail(err) {
                wx.hideLoading();
                wx.showToast({ title: '上传失败', icon: 'none' });
                reject(err);
            }
        });
    });
}

module.exports = { request, get, post, put, del, uploadFile };
