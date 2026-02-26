// pages/login/login.js
const app = getApp();
const { userApi } = require('../../utils/api');

Page({
    data: {
        phone: '',
        code: '',
        selectedRole: 'USER',
        codeBtnText: '获取验证码',
        codeBtnDisabled: false,
        countdown: 60
    },

    onPhoneInput(e) {
        this.setData({ phone: e.detail.value });
    },

    onCodeInput(e) {
        this.setData({ code: e.detail.value });
    },

    selectRole(e) {
        this.setData({ selectedRole: e.currentTarget.dataset.role });
    },

    // 发送验证码
    sendCode() {
        if (this.data.codeBtnDisabled) return;
        const phone = this.data.phone;
        if (!phone || phone.length !== 11) {
            wx.showToast({ title: '请输入正确的手机号', icon: 'none' });
            return;
        }

        // 调用后端发送短信验证码
        userApi.sendSmsCode({ phone }).then(() => {
            wx.showToast({ title: '验证码已发送', icon: 'none' });

            // 开始倒计时
            this.setData({ codeBtnDisabled: true });
            let countdown = 60;
            this.setData({ codeBtnText: countdown + 's', countdown });

            const timer = setInterval(() => {
                countdown--;
                if (countdown <= 0) {
                    clearInterval(timer);
                    this.setData({ codeBtnText: '获取验证码', codeBtnDisabled: false });
                } else {
                    this.setData({ codeBtnText: countdown + 's' });
                }
            }, 1000);
        }).catch(err => {
            console.error('发送验证码失败:', err);
        });
    },

    // 手机号验证码登录
    onLogin() {
        const { phone, code } = this.data;
        if (!phone || phone.length !== 11) {
            wx.showToast({ title: '请输入正确的手机号', icon: 'none' });
            return;
        }
        if (!code) {
            wx.showToast({ title: '请输入验证码', icon: 'none' });
            return;
        }

        // 调用后端短信登录接口
        userApi.smsLogin({ phone, code }).then(res => {
            this.doLogin(res.token, res.userInfo);
        }).catch(err => {
            console.error('短信登录失败:', err);
        });
    },

    // 微信授权登录
    onWechatLogin() {
        wx.login({
            success: (loginRes) => {
                if (loginRes.code) {
                    // 调用后端微信登录接口
                    userApi.wxLogin({ code: loginRes.code }).then(res => {
                        this.doLogin(res.token, res.userInfo);
                    }).catch(err => {
                        console.error('微信登录失败:', err);
                        wx.showToast({ title: '微信登录失败', icon: 'none' });
                    });
                } else {
                    wx.showToast({ title: '微信登录获取code失败', icon: 'none' });
                }
            },
            fail: () => {
                wx.showToast({ title: '微信登录失败', icon: 'none' });
            }
        });
    },

    // 执行登录（保存token和用户信息）
    doLogin(token, userInfo) {
        app.setLoginInfo(token, userInfo);

        wx.showToast({ title: '登录成功', icon: 'success' });
        setTimeout(() => {
            wx.navigateBack({
                fail: () => {
                    wx.switchTab({ url: '/pages/home/home' });
                }
            });
        }, 1000);
    },

    // 关闭登录页
    onClose() {
        wx.navigateBack({
            fail: () => {
                wx.switchTab({ url: '/pages/home/home' });
            }
        });
    }
});

