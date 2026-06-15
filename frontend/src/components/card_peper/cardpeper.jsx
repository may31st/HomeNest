import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';
import coursImage from "../../assets/images/cours.jpg";
import { AccessTime } from "@mui/icons-material";
import { Stack } from '@mui/material';


function CardPaper() {
  return (
    <Card sx={{ Width: "100%" , height: "100%" }}>
      <CardActionArea>
      <CardMedia
     component="img"
     height="30px"
     image={coursImage} // Dùng biến import
     alt="green iguana"
     sx={{ height: "250px", objectFit: "cover" }} // Đặt chiều cao cố định

    />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div" sx={{ marginTop: 2 }}>
            Giá trung cư Hà Nội sau Tết nguyên đán 
          </Typography>
          <Stack direction="row" alignItems="center" spacing={0.5}>
          <AccessTime sx={{ color: "gray" }} /> {/* Icon đồng hồ */}
          <Typography variant="body2">2 ngày trước</Typography>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
export default CardPaper;