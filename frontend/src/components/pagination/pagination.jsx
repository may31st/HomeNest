import * as React from 'react';
import Pagination from '@mui/material/Pagination';

function PaginationComponents() {
    return (
        <Pagination 
            count={5} 
            size="large" 
            sx={{ 
                "& .MuiPaginationItem-page.Mui-selected": { backgroundColor: "#4caf4f", color: "#fff" }, // Màu nền của trang được chọn
            }} 
        />
    );
}

export default PaginationComponents;
