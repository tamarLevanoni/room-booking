# 1. Project Overview

## 1.1 System Description

Room Booking Platform - A full web-based system for searching, booking, and managing room reservations.

**What the system does:**
- User registration and login
- Display available rooms
- Check availability by dates
- Create bookings (automatic, no approval needed)

**Users:**
- Regular users only
- No Admin/Coordinator roles

**Core Flow:**
```
Registration → Login → Browse Rooms → Check Availability → Book
```

## 1.2 Architecture Summary

**Frontend:**
- React (standalone app)
- State management: React Query+Zustand
- REST API communication

**Backend:**
- Node.js + TypeScript
- Express.js
- Layered architecture: routes → services → db
- Stateless (scalable behind load balancer)

**Database:**
- MongoDB
- Mongoose ODM
- Collections: Users, Rooms, Bookings

**Cache:**
- Redis

**Infrastructure:**
- Docker containers
- docker-compose for local dev
- Environment separation: local/staging/production

## 1.3 Core Business Rules

**Rooms:**
- Fixed rooms in data (seed/migration)
- No room management through UI

**Booking Times:**
- Check-in: 15:00
- Check-out: 11:00

**Booking Rules:**
- Bookings are automatically approved
- User can book multiple rooms at the same time
- No time limit for advance booking (can book as far ahead as desired)
- Cannot cancel bookings

**Concurrency:**
- Transaction isolation to prevent double booking
- MongoDB Atomic Upsert
- Optimistic locking with version field
