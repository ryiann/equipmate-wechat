// pages/equipment-form/equipment-form.js
const app = getApp();
const { equipmentApi } = require('../../utils/api');
const { EQUIPMENT_CATEGORIES } = require('../../utils/constants');

Page({
    data: {
        isEdit: false,
        id: '',
        form: { name: '', equipmentNo: '', categoryName: '', status: 'IDLE', brand: '', model: '', location: '', purchaseDate: '', purchasePrice: '', supplier: '', description: '' },
        categories: EQUIPMENT_CATEGORIES.filter(c => c !== '全部'),
        categoryIndex: 0,
        statusOptions: ['闲置', '使用中', '维修中', '报废'],
        statusValues: ['IDLE', 'IN_USE', 'MAINTENANCE', 'SCRAPPED'],
        statusIndex: 0,
        imageList: []
    },

    onLoad(options) {
        if (options.id) {
            this.setData({ isEdit: true, id: options.id });
            wx.setNavigationBarTitle({ title: '编辑设备' });
            this.loadDetail(options.id);
        } else {
            wx.setNavigationBarTitle({ title: '新增设备' });
        }
    },

    async loadDetail(id) {
        try {
            const detail = await equipmentApi.getDetail(id);
            this.setData({
                form: {
                    name: detail.name || '', equipmentNo: detail.equipmentNo || '',
                    categoryName: detail.categoryName || '', brand: detail.brand || '',
                    model: detail.model || '', location: detail.location || '',
                    purchaseDate: detail.purchaseDate || '', purchasePrice: detail.purchasePrice || '',
                    supplier: detail.supplier || '', description: detail.description || ''
                },
                imageList: (detail.images || []).map(i => i.imageUrl)
            });
        } catch (e) { console.error(e); }
    },

    onInput(e) {
        const field = e.currentTarget.dataset.field;
        this.setData({ ['form.' + field]: e.detail.value });
    },

    onCategoryChange(e) {
        const idx = e.detail.value;
        this.setData({ categoryIndex: idx, 'form.categoryName': this.data.categories[idx] });
    },

    onStatusChange(e) {
        const idx = e.detail.value;
        this.setData({ statusIndex: idx, 'form.status': this.data.statusValues[idx] });
    },

    onDateChange(e) {
        const field = e.currentTarget.dataset.field;
        this.setData({ ['form.' + field]: e.detail.value });
    },

    chooseImage() {
        wx.chooseMedia({
            count: 9 - this.data.imageList.length,
            mediaType: ['image'],
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
        if (!form.name) { wx.showToast({ title: '请输入设备名称', icon: 'none' }); return; }
        if (!form.equipmentNo) { wx.showToast({ title: '请输入设备编号', icon: 'none' }); return; }

        try {
            if (this.data.isEdit) {
                await equipmentApi.update(this.data.id, form);
            } else {
                await equipmentApi.create(form);
            }

            // 上传图片
            for (const img of this.data.imageList) {
                if (img.startsWith('wxfile://') || img.startsWith('http://tmp')) {
                    await equipmentApi.uploadImage(img);
                }
            }

            wx.showToast({ title: this.data.isEdit ? '修改成功' : '新增成功' });
            setTimeout(() => wx.navigateBack(), 1000);
        } catch (e) {
            console.error(e);
        }
    }
});
