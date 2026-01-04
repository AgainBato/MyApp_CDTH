import React, { useState, useMemo, useEffect } from 'react';
import { FaChevronDown, FaPrint, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify'; 
import { useLocation } from 'react-router-dom';
import axiosClient from '../api/axiosClient'; 

const OrderManager = () => {
  const location = useLocation();

  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const formattedDate = `${currentTime.getDate().toString().padStart(2,'0')}/${(currentTime.getMonth()+1).toString().padStart(2,'0')}/${currentTime.getFullYear()}`;

  const [orders, setOrders] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'Pending'); 
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const fetchOrders = async (status) => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/admin/orders', {
        params: {
          trangThai: status, 
          PageSize: 100,     
          PageNumber: 1
        }
      });

      let rawData = [];
      
      if (res.data?.data?.items) {
          rawData = res.data.data.items;
      } else if (res.data?.items) {
          rawData = res.data.items;
      } else if (Array.isArray(res.data?.data)) {
          rawData = res.data.data;
      } else if (Array.isArray(res.data)) {
          rawData = res.data;
      }

      const mappedOrders = rawData.map(o => ({
        id: o.orderId,                  
        customer: o.customerName || "Khách lẻ", 
        phone: o.customerPhone || "---", 
        total: o.totalAmount,           
        status: o.tinhTrang,            
        type: o.ghiChu?.includes("Web POS") ? "POS" : "Online", 
        itemsCount: o.items?.length || 0, 
        items: o.items?.map(ct => ({
            name: ct.tenSanPham,       
            qty: ct.soLuong,
            price: ct.giaDonVi
        })) || []
      }));

      setOrders(mappedOrders);
    } catch (error) {
      console.error(error);
      if(error.response && error.response.status === 404) {
          setOrders([]);
      } else {
          toast.error("Lỗi tải danh sách đơn hàng");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSelectedOrderId(null); 
    fetchOrders(activeTab);
  }, [activeTab]);

  const updateStatus = async (id, newStatus) => {
    try {
        await axiosClient.put(`/admin/orders/${id}/status`, {
            NewStatus: newStatus 
        });

        toast.success(`Đã cập nhật đơn #${id} thành ${newStatus}`);
        
        fetchOrders(activeTab);
        setSelectedOrderId(null);

    } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.message || "Cập nhật thất bại");
    }
  };

  const handleAccept = () => updateStatus(selectedOrderId, 'In Process');
  const handleComplete = () => updateStatus(selectedOrderId, 'Completed');
  const handleCancel = () => updateStatus(selectedOrderId, 'Canceled');

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const selectedOrder = orders.find(o => o.id === selectedOrderId);

  const styles = {
    container: { display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', fontFamily: 'Arial, sans-serif' },
    title: { fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' },
    filterBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: '15px 20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
    tabsGroup: { display: 'flex', gap: '20px' },
    tabItem: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: 'bold' },
    dot: (color) => ({ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: color }),
    dateSelector: { display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold', cursor: 'pointer', color: '#333', fontSize: '15px' },
    contentArea: { display: 'flex', flex: 1, backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' },
    
    col1: { flex: 2, textAlign: 'left' },             
    col2: { flex: 4, textAlign: 'left', paddingLeft: '10px' }, 
    col3: { flex: 2, textAlign: 'center' },             
    col4: { flex: 2, textAlign: 'right', fontWeight: 'bold' }, 
    
    leftColumn: { flex: 7, borderRight: '1px solid #eee', display: 'flex', flexDirection: 'column', overflowY: 'auto' },
    tableHeader: { display: 'flex', alignItems: 'center', padding: '15px 20px', borderBottom: '2px solid #eee', fontWeight: 'bold', fontSize: '15px', color: '#000', position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 1 },
    tableRow: (isSelected) => ({ display: 'flex', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid #f0f0f0', fontSize: '14px', cursor: 'pointer', color: '#333', backgroundColor: isSelected ? '#FFF7ED' : 'transparent', transition: 'background 0.2s' }),
    
    rightColumn: { flex: 3, padding: '20px', display: 'flex', flexDirection: 'column' },
    detailHeader: { fontSize: '16px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center', display: 'flex', justifyContent: 'space-between' },
    infoBlock: { fontSize: '14px', lineHeight: '1.6', marginBottom: '20px', color: '#333' },
    itemsBlock: { flex: 1, fontSize: '14px', overflowY: 'auto' },
    itemRow: { display: 'flex', gap: '10px', marginBottom: '10px', borderBottom: '1px dashed #eee', paddingBottom: '5px' },
    totalBlock: { marginTop: '20px', paddingTop: '20px', borderTop: '2px solid #eee', fontSize: '16px', fontWeight: 'bold' },
    
    actionBtn: (type) => ({ 
        width: '100%', 
        backgroundColor: type === 'ACCEPT' ? '#3B82F6' : (type === 'COMPLETE' ? '#16a34a' : (type === 'CANCEL' ? '#ef4444' : '#ccc')), 
        color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', textTransform: 'uppercase', marginTop: '10px' 
    }),
    printBtn: { cursor: 'pointer', color: '#666', fontSize: '18px' }
  };

  const tabs = ['Pending', 'In Process', 'Completed', 'Canceled'];

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Order Manager</h1>

      <div style={styles.filterBar}>
        <div style={styles.tabsGroup}>
          {tabs.map(status => (
            <div key={status} style={styles.tabItem} onClick={() => setActiveTab(status)}>
              <div style={styles.dot(activeTab === status ? '#FF8A65' : '#ddd')}></div>
              <span style={{color: activeTab === status ? '#000' : '#888'}}>{status}</span>
            </div>
          ))}
        </div>
        <div style={styles.dateSelector}><span>{formattedDate}</span><FaChevronDown size={14} /></div>
      </div>

      <div style={styles.contentArea}>
        <div style={styles.leftColumn}>
          <div style={styles.tableHeader}>
            <div style={styles.col1}>Order ID</div>
            <div style={styles.col2}>Customer</div>
            <div style={styles.col3}>Items</div>
            <div style={styles.col4}>Total</div>
          </div>
          
          {loading ? (
             <div style={{padding:'40px', textAlign:'center', color:'#666'}}>
                <FaSpinner className="spinner" /> Đang tải dữ liệu...
             </div>
          ) : orders.length === 0 ? (
             <div style={{padding:'40px', textAlign:'center', color:'#999'}}>Không có đơn hàng ({activeTab})</div>
          ) : (
            orders.map((order) => (
                <div 
                    key={order.id} 
                    style={styles.tableRow(selectedOrderId === order.id)}
                    onClick={() => setSelectedOrderId(order.id)}
                >
                    <div style={styles.col1}>#{order.id}</div>
                    <div style={styles.col2}>
                        {order.customer}
                        {order.type === 'POS' && <span style={{fontSize:'10px', background:'#eee', padding:'2px 5px', borderRadius:'4px', marginLeft:'5px'}}>POS</span>}
                    </div>
                    <div style={styles.col3}>{order.itemsCount}</div>
                    <div style={styles.col4}>{formatPrice(order.total)}</div>
                </div>
            ))
          )}
        </div>

        <div style={styles.rightColumn}>
          <div style={styles.detailHeader}>
              <span>CHI TIẾT ĐƠN</span>
              <FaPrint style={styles.printBtn} onClick={() => toast.info("Tính năng in đang phát triển")} />
          </div>
          
          {selectedOrder ? (
            <>
                <div style={styles.infoBlock}>
                    <div style={{fontWeight: 'bold', fontSize: '18px', marginBottom: '5px', color: '#EA580C'}}>#{selectedOrder.id}</div>
                    <div>Khách: <b>{selectedOrder.customer}</b></div>
                    <div>SĐT: {selectedOrder.phone}</div>
                    <div>Loại: {selectedOrder.type}</div>
                    <div style={{marginTop: '5px'}}>
                        Trạng thái: <span style={{color: '#FF5722', fontWeight: 'bold'}}>{selectedOrder.status}</span>
                    </div>
                </div>

                <div style={styles.itemsBlock}>
                    <div style={{marginBottom: '10px', fontWeight: 'bold', borderBottom: '1px solid #eee', paddingBottom: '5px'}}>
                        Danh sách món ({selectedOrder.items ? selectedOrder.items.length : 0})
                    </div>
                    {selectedOrder.items && selectedOrder.items.map((item, idx) => (
                    <div key={idx} style={styles.itemRow}>
                        <span style={{fontWeight: 'bold', color: '#FF5722'}}>{item.qty}x</span>
                        <div style={{marginLeft:'8px'}}>{item.name}</div>
                    </div>
                    ))}
                </div>

                <div style={styles.totalBlock}>
                    Tổng tiền: <span style={{float: 'right', color: '#FF5722'}}>{formatPrice(selectedOrder.total)}</span>
                </div>
                
                <div style={{marginTop:'15px'}}>
                    {activeTab === 'Pending' && (
                        <>
                            <button style={styles.actionBtn('ACCEPT')} onClick={handleAccept}>DUYỆT ĐƠN</button>
                            <button style={styles.actionBtn('CANCEL')} onClick={handleCancel}>HỦY BỎ</button>
                        </>
                    )}
                    {activeTab === 'In Process' && (
                        <>
                            <button style={styles.actionBtn('COMPLETE')} onClick={handleComplete}>THANH TOÁN</button>
                            <button style={styles.actionBtn('CANCEL')} onClick={handleCancel}>HỦY BỎ</button>
                        </>
                    )}
                    {(activeTab === 'Completed' || activeTab === 'Canceled') && (
                        <button style={styles.actionBtn('DISABLED')} disabled>ĐÃ ĐÓNG</button>
                    )}
                </div>
            </>
          ) : (
              <div style={{textAlign: 'center', color: '#999', marginTop: '50px'}}>Chọn một đơn hàng để xem</div>
          )}
        </div>
      </div>
      <style>{`.spinner { animation: spin 1s linear infinite; } @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default OrderManager;