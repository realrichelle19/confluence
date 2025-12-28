import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  Badge,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  Map as MapIcon,
  Build as SkillsIcon,
  Warning as IncidentsIcon,
  Assignment as AssignmentsIcon,
  Assessment as ReportsIcon,
  Menu as MenuIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'

const drawerWidth = 280

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: '3D Map', icon: <MapIcon />, path: '/map' },
  { text: 'Skills', icon: <SkillsIcon />, path: '/skills' },
  { text: 'Incidents', icon: <IncidentsIcon />, path: '/incidents' },
  { text: 'Assignments', icon: <AssignmentsIcon />, path: '/assignments' },
  { text: 'Reports', icon: <ReportsIcon />, path: '/reports' },
]

export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout, isCoordinator } = useAuth()
  const { connected } = useSocket()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
    handleMenuClose()
  }

  const drawer = (
    <Box sx={{ background: '#1a1f3a', height: '100%', color: '#fff' }}>
      <Toolbar sx={{ background: '#0f1422', borderBottom: '1px solid #2a2f4a' }}>
        <Typography variant="h6" noWrap component="div" sx={{ 
          color: '#4a90e2', 
          fontWeight: 'bold',
          fontSize: '20px'
        }}>
          Flood Emergency
        </Typography>
      </Toolbar>
      <List sx={{ pt: 2 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => {
                  navigate(item.path)
                  setMobileOpen(false)
                }}
                sx={{
                  backgroundColor: isActive ? '#2a3f5f' : 'transparent',
                  borderLeft: isActive ? '3px solid #4a90e2' : '3px solid transparent',
                  '&:hover': {
                    backgroundColor: '#2a2f4a',
                  },
                  py: 1.5,
                  px: 3,
                }}
              >
                <ListItemIcon sx={{ color: isActive ? '#4a90e2' : '#9ca3af', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{
                    fontSize: '15px',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? '#fff' : '#9ca3af'
                  }}
                />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>
      <Box sx={{ position: 'absolute', bottom: 20, left: 0, right: 0, px: 2 }}>
        <Box sx={{ 
          background: connected ? '#10b981' : '#ef4444', 
          color: '#fff', 
          p: 1, 
          borderRadius: 1,
          textAlign: 'center',
          fontSize: '12px'
        }}>
          {connected ? '● Connected' : '● Disconnected'}
        </Box>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#0a0e27' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          background: '#1a1f3a',
          borderBottom: '1px solid #2a2f4a',
          boxShadow: 'none',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, color: '#fff' }}>
            {menuItems.find(item => item.path === location.pathname)?.text || 'Dashboard'}
          </Typography>
          <IconButton color="inherit" sx={{ mr: 1 }}>
            <Badge badgeContent={0} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <IconButton onClick={handleMenuOpen} sx={{ ml: 1 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: '#4a90e2' }}>
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                background: '#1a1f3a',
                color: '#fff',
                mt: 1,
                minWidth: 200,
              }
            }}
          >
            <MenuItem onClick={handleMenuClose}>
              <PersonIcon sx={{ mr: 1, fontSize: 20 }} />
              <Box>
                <Typography variant="body2" sx={{ color: '#fff' }}>{user?.name}</Typography>
                <Typography variant="caption" sx={{ color: '#9ca3af', textTransform: 'capitalize' }}>
                  {user?.role}
                </Typography>
              </Box>
            </MenuItem>
            <Divider sx={{ borderColor: '#2a2f4a' }} />
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1, fontSize: 20 }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: '64px',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  )
}

