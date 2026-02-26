// pages/profile-edit/profile-edit.js
const app = getApp();
const { userApi, fileApi } = require('../../utils/api');

Page({
    data: {
        form: { avatarUrl: '', nickname: '', realName: '', phone: '', department: '' }
    },

    onLoad() {
        const userInfo = app.globalData.userInfo || {};
        this.setData({
            form: {
                avatarUrl: userInfo.avatarUrl || '',
                nickname: userInfo.nickname || '',
                realName: userInfo.realName || '',
                phone: userInfo.phone || '',
                department: userInfo.department || ''
            }
        });
    },

    onInput(e) {
        const field = e.currentTarget.dataset.field;
        this.setData({ ['form.' + field]: e.detail.value });
    },

    changeAvatar() {
        wx.chooseMedia({
            count: 1,
            mediaType: ['image'],
            success: async (res) => {
                const tempPath = res.tempFiles[0].tempFilePath;
                this.setData({ 'form.avatarUrl': tempPath });
                // 上传头像
                try {
                    const result = await fileApi.upload(tempPath);
                    if (result && result.url) {
                        this.setData({ 'form.avatarUrl': result.url });
                    }
                } catch (e) { console.error(e); }
            }
        });
    },

    async onSave() {
        const { form } = this.data;
        try {
            await userApi.updateUserInfo(form);
            // 更新全局用户信息
            const userInfo = { ...app.globalData.userInfo, ...form };
            app.setLoginInfo(app.globalData.token, userInfo);
            wx.showToast({ title: '保存成功' });
            setTimeout(() => wx.navigateBack(), 1000);
        } catch (e) {
            console.error(e);
            // 演示模式
            const userInfo = { ...app.globalData.userInfo, ...form };
            app.setLoginInfo(app.globalData.token, userInfo);
            wx.showToast({ title: '保存成功' });
            setTimeout(() => wx.navigateBack(), 1000);
        }
    }
});
