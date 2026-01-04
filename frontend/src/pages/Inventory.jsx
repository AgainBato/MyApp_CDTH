import React, { useState, useEffect } from 'react';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axiosClient from '../api/axiosClient';

const Inventory = () => {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // State cho Modal (Thêm/Sửa)
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // Nếu null là Thêm mới
  const [formData, setFormData] = useState({
    tenNguyenLieu: "",
    soLuongTon: 0,
    donViTinh: "g" // Mặc định
  });

  // 1. Load dữ liệu
  const fetchIngredients = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get(`/NguyenLieu?search=${search}`);
      // Xử lý dữ liệu trả về tùy theo cấu trúc wrapper của bạn
      const data = res.data.data || res.data; 
      setIngredients(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Lỗi tải kho hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, [search]); // Tự động tìm khi gõ search

  // 2. Xử lý xóa
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa nguyên liệu này?")) return;
    try {
      await axiosClient.delete(`/NguyenLieu/${id}`);
      toast.success("Đã xóa nguyên liệu");
      fetchIngredients();
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể xóa (đang dùng trong món?)");
    }
  };

  // 3. Mở Modal
  const openModal = (item = null) => {
    setEditingItem(item);
    if (item) {
      setFormData({
        tenNguyenLieu: item.tenNguyenLieu,
        soLuongTon: item.soLuongTon,
        donViTinh: item.donViTinh
      });
    } else {
      setFormData({ tenNguyenLieu: "", soLuongTon: 0, donViTinh: "g" });
    }
    setShowModal(true);
  };

  // 4. Lưu (Thêm mới hoặc Cập nhật)
  const handleSave = async () => {
    if (!formData.tenNguyenLieu) return toast.warning("Chưa nhập tên nguyên liệu");

    try {
      if (editingItem) {
        // CẬP NHẬT
        await axiosClient.put(`/NguyenLieu/${editingItem.idNguyenLieu}`, formData);
        toast.success("Cập nhật thành công!");
      } else {
        // THÊM MỚI
        await axiosClient.post(`/NguyenLieu`, formData);
        toast.success("Thêm mới thành công!");
      }
      setShowModal(false);
      fetchIngredients();
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi lưu dữ liệu");
    }
  };

  // --- STYLES ---
  const styles = {
    container: { padding: '20px', fontFamily: 'Arial, sans-serif', height: '100%', display: 'flex', flexDirection: 'column' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    title: { fontSize: '24px', fontWeight: 'bold', color: '#333' },
    actions: { display: 'flex', gap: '10px' },
    searchBox: { display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #ddd', borderRadius: '6px', padding: '8px 12px', width: '300px' },
    input: { border: 'none', outline: 'none', marginLeft: '8px', width: '100%' },
    addBtn: { display: 'flex', alignItems: 'center', gap: '5px', background: '#EA580C', color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
    tableContainer: { flex: 1, background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', overflowY: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { background: '#f9fafb', padding: '15px', textAlign: 'left', borderBottom: '1px solid #eee', fontWeight: 'bold', color: '#555', position: 'sticky', top: 0 },
    td: { padding: '15px', borderBottom: '1px solid #eee', color: '#333' },
    row: { transition: 'background 0.2s' },
    editBtn: { color: '#3B82F6', cursor: 'pointer', marginRight: '15px' },
    delBtn: { color: '#EF4444', cursor: 'pointer' },
    
    // Modal Styles
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modal: { background: '#fff', padding: '25px', borderRadius: '8px', width: '400px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
    modalTitle: { fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' },
    formGroup: { marginBottom: '15px' },
    label: { display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' },
    formInput: { width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', outline: 'none' },
    modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' },
    cancelBtn: { background: '#ccc', color: '#333', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' },
    saveBtn: { background: '#EA580C', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Quản lý Kho</h1>
        <div style={styles.actions}>
          <div style={styles.searchBox}>
            <FaSearch color="#888" />
            <input 
              style={styles.input} 
              placeholder="Tìm nguyên liệu..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
          </div>
          <button style={styles.addBtn} onClick={() => openModal(null)}>
            <FaPlus /> Thêm mới
          </button>
        </div>
      </div>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Tên Nguyên Liệu</th>
              <th style={styles.th}>Tồn Kho</th>
              <th style={styles.th}>Đơn Vị</th>
              <th style={styles.th}>Cập Nhật Cuối</th>
              <th style={{...styles.th, textAlign: 'center'}}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
               <tr><td colSpan="6" style={{textAlign:'center', padding:'20px'}}>Đang tải...</td></tr>
            ) : ingredients.length === 0 ? (
               <tr><td colSpan="6" style={{textAlign:'center', padding:'20px'}}>Kho trống</td></tr>
            ) : (
              ingredients.map(item => (
                <tr key={item.idNguyenLieu} style={styles.row}>
                  <td style={styles.td}>#{item.idNguyenLieu}</td>
                  <td style={{...styles.td, fontWeight: 'bold'}}>{item.tenNguyenLieu}</td>
                  <td style={{...styles.td, color: item.soLuongTon <= 0 ? 'red' : 'green', fontWeight:'bold'}}>
                    {item.soLuongTon}
                  </td>
                  <td style={styles.td}>{item.donViTinh}</td>
                  <td style={styles.td}>{item.ngayCapNhat ? new Date(item.ngayCapNhat).toLocaleDateString('vi-VN') : '-'}</td>
                  <td style={{...styles.td, textAlign: 'center'}}>
                    <FaEdit style={styles.editBtn} onClick={() => openModal(item)} title="Sửa / Nhập kho" />
                    <FaTrash style={styles.delBtn} onClick={() => handleDelete(item.idNguyenLieu)} title="Xóa" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL THÊM / SỬA */}
      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalTitle}>{editingItem ? "Cập Nhật Kho" : "Thêm Nguyên Liệu Mới"}</div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Tên nguyên liệu</label>
              <input 
                style={styles.formInput} 
                value={formData.tenNguyenLieu} 
                onChange={e => setFormData({...formData, tenNguyenLieu: e.target.value})}
                placeholder="VD: Trà Đen, Sữa Tươi..."
              />
            </div>

            <div style={{display:'flex', gap:'15px'}}>
                <div style={{...styles.formGroup, flex: 1}}>
                <label style={styles.label}>Số lượng tồn</label>
                <input 
                    type="number"
                    style={styles.formInput} 
                    value={formData.soLuongTon} 
                    onChange={e => setFormData({...formData, soLuongTon: Number(e.target.value)})}
                />
                </div>
                <div style={{...styles.formGroup, flex: 1}}>
                <label style={styles.label}>Đơn vị tính</label>
                <select 
                    style={styles.formInput} 
                    value={formData.donViTinh} 
                    onChange={e => setFormData({...formData, donViTinh: e.target.value})}
                >
                    <option value="g">Gam (g)</option>
                    <option value="ml">Mili lít (ml)</option>
                    <option value="chai">Chai</option>
                    <option value="hop">Hộp</option>
                    <option value="bao">Bao</option>
                </select>
                </div>
            </div>

            <div style={styles.modalActions}>
              <button style={styles.cancelBtn} onClick={() => setShowModal(false)}>Hủy</button>
              <button style={styles.saveBtn} onClick={handleSave}>
                <FaSave style={{marginRight: '5px'}}/> Lưu lại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;