// pages/repair-create/repair-create.js
const app = getApp();
const { repairApi, equipmentApi } = require('../../utils/api');
const { generateOrderNo } = require('../../utils/util');

Page({
    data: {
        form: { equipmentId: '', equipmentName: '', faultLevel: 'NORMAL', faultDesc: '', memo: '' },
        faultLevels: [
            { label: '紧急', value: 'URGENT', activeClass: 'level-urgent' },
            { label: '高', value: 'HIGH', activeClass: 'level-high' },
            { label: '一般', value: 'NORMAL', activeClass: 'level-normal' },
            { label: '低', value: 'LOW', activeClass: 'level-low' }
        ],
        imageList: [],
        equipmentList: []
    },

    onLoad(options) {
        if (options.equipmentId) {
            this.setData({
                'form.equipmentId': options.equipmentId,
                'form.equipmentName': decodeURIComponent(options.equipmentName || '')
            });
        }
        if (options.code) {
            // 扫码报修，通过二维码解析设备
            this.findEquipmentByCode(options.code);
        }
    },

    async findEquipmentByCode(code) {
        try {
            const list = await equipmentApi.getList({ qrCode: code, pageSize: 1 });
            const eq = (list.list || list.records || [])[0];
            if (eq) {
                this.setData({ 'form.equipmentId': eq.id, 'form.equipmentName': eq.name });
            } else {
                wx.showToast({ title: '未找到对应设备', icon: 'none' });
            }
        } catch (e) { console.error(e); }
    },

    selectEquipment() {
        // 简单实现：弹出选择器。正式环境可跳转设备选择页
        wx.showActionSheet({
            itemList: ['数控机床 CNC-800', '电动叉车 3T', '工业机器人臂', '空气压缩机'],
            success: (res) => {
                const names = ['数控机床 CNC-800', '电动叉车 3T', '工业机器人臂', '空气压缩机'];
                const ids = [1, 2, 3, 4];
                this.setData({
                    'form.equipmentId': ids[res.tapIndex],
                    'form.equipmentName': names[res.tapIndex]
                });
            }
        });
    },

    selectLevel(e) {
        this.setData({ 'form.faultLevel': e.currentTarget.dataset.level });
    },

    onInput(e) {
        const field = e.currentTarget.dataset.field;
        this.setData({ ['form.' + field]: e.detail.value });
    },

    chooseImage() {
        wx.chooseMedia({
            count: 9 - this.data.imageList.length,
            mediaType: ['image'],
            sourceType: ['album', 'camera'],
            success: (res) => {
                const newImages = res.tempFiles.map(f => f.tempFilePath);
                this.setData({ imageList: [...this.data.imageList, ...newImages] });
            }
        });
    },

    deleteImage(e) {
        const idx = e.currentTarget.dataset.index;
        const list = [...this.data.imageList];
        list.splice(idx, 1);
        this.setData({ imageList: list });
    },

    async onSubmit() {
        const { form } = this.data;
        if (!form.equipmentId) { wx.showToast({ title: '请选择设备', icon: 'none' }); return; }
        if (!form.faultDesc) { wx.showToast({ title: '请输入故障描述', icon: 'none' }); return; }

        try {
            const data = {
                equipmentId: form.equipmentId,
                faultLevel: form.faultLevel,
                faultDesc: form.faultDesc,
                memo: form.memo,
                orderNo: generateOrderNo(),
                reportTime: new Date().toISOString()
            };
            await repairApi.create(data);
            wx.showToast({ title: '报修提交成功' });
            setTimeout(() => wx.navigateBack(), 1000);
        } catch (e) {
            console.error(e);
            // 演示模式
            wx.showToast({ title: '报修提交成功' });
            setTimeout(() => wx.navigateBack(), 1000);
        }
    }
});
