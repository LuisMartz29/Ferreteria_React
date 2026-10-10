package com.example.sistema_ferreteria.repository;

import com.example.sistema_ferreteria.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductoRepository extends JpaRepository<Producto, Long> {}
