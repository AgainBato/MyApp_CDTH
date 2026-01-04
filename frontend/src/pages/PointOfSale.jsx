import React, { useState, useEffect } from 'react';
import { FaSearch, FaTrash, FaSpinner, FaPlus, FaMinus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosClient from '../api/axiosClient';

const teaImg = "https://cdn-icons-png.flaticon.com/512/3081/3081162.png"; 

const PointOfSale = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); 
  const [cart, setCart] = useState([]); 
  
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [orderId, setOrderId] = useState("NEW");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axiosClient.get('/SanPhams?PageSize=100');
        
        const mappedData = res.data.items.map(p => ({
            id: p.idSanPham,
            name: p.tenSanPham,
            category: "All Menu",
            price: p.gia,
            img: p.imageUrl || teaImg,
            stock: 999
        }));

        setProducts(mappedData);
      } catch (error) {
        console.error("Lỗi lấy sản phẩm:", error);
        toast.error("Không tải được Menu!");
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSearch;
  });

  const addToCart = (product) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      } else {
        return [...prev, { ...product, qty: 1 }];
      }
    });
  };

  // --- HÀM MỚI: TĂNG/GIẢM SỐ LƯỢNG ---
  const updateQuantity = (id, change) => {
      setCart(prev => prev.map(item => {
          if (item.id === id) {
              const newQty = item.qty + change;
              if (newQty < 1) return item; // Không cho giảm dưới 1 (dùng nút xóa nếu muốn xóa)
              return { ...item, qty: newQty };
          }
          return item;
      }));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const handleConfirm = async () => {
    if (cart.length === 0) {
      toast.warning("Giỏ hàng đang trống!");
      return;
    }

    setIsLoading(true);

    const orderPayload = {
        items: cart.map(item => ({
            idSanPham: item.id,
            soLuong: item.qty
        })),
        paymentMethod: "CASH",
        amountReceived: totalAmount,
        note: `Khách hàng: ${customerName || "Khách lẻ"} - SĐT: ${customerPhone || ""}`
    };

    try {
        await axiosClient.post('/Pos/create-order', orderPayload);
        
        toast.success("Tạo đơn thành công!");
        
        setCart([]);
        setCustomerName("");
        setCustomerPhone("");
        
        setTimeout(() => {
            navigate('/orders', { state: { activeTab: 'In Process' } }); 
        }, 1000);

    } catch (error) {
        console.error(error);
        const msg = error.response?.data?.message || "Lỗi khi tạo đơn!";
        toast.error(msg);
    } finally {
        setIsLoading(false);
    }
  };

  const styles = {
    container: { display: 'flex', flexDirection: 'column', height: '100%', gap: '15px', fontFamily: 'Arial, sans-serif' },
    title: { fontSize: '24px', fontWeight: 'bold', marginBottom: '0px' },
    topSection: { backgroundColor: '#fff', padding: '15px 20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    dateSelector: { display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold', fontSize: '15px', color: '#333' },
    searchSection: { display: 'flex', alignItems: 'center', backgroundColor: '#fff', padding: '10px 20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', gap: '10px' },
    searchInput: { border: 'none', outline: 'none', fontSize: '14px', width: '100%', color: '#333' },
    mainArea: { display: 'flex', flex: 1, gap: '15px', overflow: 'hidden' },
    productList: { flex: 7, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gridAutoRows: 'max-content', gap: '12px', overflowY: 'auto', paddingRight: '5px', alignContent: 'start' },
    productCard: { backgroundColor: '#fff', borderRadius: '8px', padding: '10px', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', border: '1px solid #eee' },
    productImg: { width: '50px', height: '60px', objectFit: 'contain' },
    productInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' },
    productName: { fontSize: '13px', fontWeight: 'bold', color: '#333', lineHeight: '1.2' },
    productPrice: { fontSize: '13px', color: '#EA580C', fontWeight: 'bold' },
    addButton: { backgroundColor: '#EA580C', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px', width: 'fit-content' },
    orderDetail: { flex: 3, backgroundColor: '#fff', borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column', boxShadow: '0 1px 3px rgba(0,0,0,0.1' },
    orderHeader: { fontSize: '16px', fontWeight: 'bold', marginBottom: '15px', textAlign: 'center' },
    orderIdDisplay: { textAlign: 'center', marginBottom: '15px', fontSize: '18px', fontWeight: '900', color: '#EA580C', borderBottom: '2px dashed #eee', paddingBottom: '10px' },
    customerForm: { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '15px' },
    input: { padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', outline: 'none' },
    itemList: { flex: 1, overflowY: 'auto', marginBottom: '15px' },
    cartItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', marginBottom: '8px', borderBottom: '1px dashed #f0f0f0', paddingBottom: '5px' },
    deleteBtn: { color: '#ff4d4f', cursor: 'pointer', marginLeft: '10px' },
    qtyBtn: { cursor: 'pointer', padding: '2px 6px', background: '#eee', borderRadius: '4px', margin: '0 5px', fontSize: '10px', fontWeight: 'bold' }, // Style mới cho nút +/-
    totalSection: { marginTop: 'auto', paddingTop: '15px', borderTop: '2px solid #eee' },
    totalText: { fontSize: '16px', fontWeight: 'bold', marginBottom: '15px' },
    confirmBtn: { width: '100%', backgroundColor: isLoading ? '#ccc' : '#EA580C', color: '#fff', border: 'none', padding: '15px', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: isLoading ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', gap: '10px' }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Point of Sale</h1>

      <div style={styles.topSection}>
        <span style={{fontWeight:'bold'}}>MENU</span>
        <div style={styles.dateSelector}>
            <span>{new Date().toLocaleDateString('vi-VN')}</span>
        </div>
      </div>

      <div style={styles.searchSection}>
        <FaSearch color="#888" />
        <input style={styles.searchInput} placeholder="Tìm kiếm món..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
      </div>

      <div style={styles.mainArea}>
        <div style={styles.productList}>
          {filteredProducts.map((p) => (
            <div key={p.id} style={styles.productCard}>
              <img src={p.img} alt={p.name} style={styles.productImg} />
              <div style={styles.productInfo}>
                <span style={styles.productName}>{p.name}</span>
                <span style={styles.productPrice}>{formatPrice(p.price)}</span>
                <button style={styles.addButton} onClick={() => addToCart(p)}>THÊM</button>
              </div>
            </div>
          ))}
          {filteredProducts.length === 0 && <div style={{gridColumn: '1/-1', textAlign: 'center', color: '#999', marginTop: '20px'}}>Đang tải hoặc không có món...</div>}
        </div>

        <div style={styles.orderDetail}>
          <div style={styles.orderHeader}>HÓA ĐƠN</div>
          <div style={styles.orderIdDisplay}>{orderId}</div>

          <div style={styles.customerForm}>
             <input style={styles.input} placeholder="Tên khách hàng" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
             <input style={styles.input} placeholder="Số điện thoại" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
          </div>

          <div style={styles.itemList}>
            <div style={{fontSize: '14px', fontWeight: 'bold', marginBottom: '10px'}}>Món đã chọn ({cart.length})</div>
            {cart.length === 0 ? (
                <div style={{textAlign: 'center', color: '#ccc', fontStyle: 'italic', marginTop: '20px'}}>Giỏ hàng trống</div>
            ) : (
                cart.map((item) => (
                    <div key={item.id} style={styles.cartItem}>
                        <div style={{flex: 1}}>
                            <div style={{fontWeight: 'bold'}}>{item.name}</div>
                            <div style={{color: '#EA580C'}}>{formatPrice(item.price)}</div>
                        </div>
                        
                        {/* PHẦN CHỈNH SỬA SỐ LƯỢNG MỚI */}
                        <div style={{display: 'flex', alignItems: 'center'}}>
                            <span style={styles.qtyBtn} onClick={() => updateQuantity(item.id, -1)}><FaMinus size={8}/></span>
                            <span style={{fontWeight: 'bold', width: '20px', textAlign: 'center'}}>{item.qty}</span>
                            <span style={styles.qtyBtn} onClick={() => updateQuantity(item.id, 1)}><FaPlus size={8}/></span>
                        </div>
                        
                        <FaTrash style={styles.deleteBtn} onClick={() => removeFromCart(item.id)} />
                    </div>
                ))
            )}
          </div>

          <div style={styles.totalSection}>
            <div style={styles.totalText}>
              Tổng tiền: <span style={{float: 'right', color: '#EA580C'}}>{formatPrice(totalAmount)}</span>
            </div>
            <button style={styles.confirmBtn} onClick={handleConfirm} disabled={isLoading}>
                {isLoading && <FaSpinner className="spinner" />} 
                {isLoading ? " ĐANG XỬ LÝ..." : "XÁC NHẬN"}
            </button>
            <style>{`.spinner { animation: spin 1s linear infinite; } @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PointOfSale;