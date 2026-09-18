import secrets
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from backend.app.database import Base

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    users = relationship("User", back_populates="organization")
    api_keys = relationship("ApiKey", back_populates="organization")
    jobs = relationship("BacktestJob", back_populates="organization")

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    role = Column(String, default="quant_researcher")  # admin, quant_researcher, viewer
    is_active = Column(Boolean, default=True)
    org_id = Column(String, ForeignKey("organizations.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    organization = relationship("Organization", back_populates="users")

class ApiKey(Base):
    __tablename__ = "api_keys"

    id = Column(String, primary_key=True, index=True)
    key_hash = Column(String, unique=True, index=True, nullable=False)
    key_prefix = Column(String, nullable=False)  # e.g. quant_live_a1b2
    name = Column(String, nullable=False)
    org_id = Column(String, ForeignKey("organizations.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    organization = relationship("Organization", back_populates="api_keys")

class BacktestJob(Base):
    __tablename__ = "backtest_jobs"

    id = Column(String, primary_key=True, index=True)
    status = Column(String, default="PENDING")  # PENDING, RUNNING, COMPLETED, FAILED
    symbol = Column(String, default="AAPL")
    dataset_name = Column(String, default="AAPL_LOBSTER.csv")
    confidence_threshold = Column(Float, default=0.50)
    taker_friction = Column(Float, default=0.004)
    
    # Results JSON metadata
    baseline_gross_pnl = Column(Float, nullable=True)
    baseline_net_pnl = Column(Float, nullable=True)
    sniper_net_pnl = Column(Float, nullable=True)
    total_trades = Column(Integer, nullable=True)
    result_json_path = Column(String, nullable=True)
    log_output = Column(Text, nullable=True)
    
    org_id = Column(String, ForeignKey("organizations.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    organization = relationship("Organization", back_populates="jobs")
