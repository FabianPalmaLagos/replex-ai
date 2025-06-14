#!/usr/bin/env node

/**
 * Script de verificación para la Fase 0 de Replex AI
 * Verifica que todos los servicios y configuraciones estén funcionando correctamente
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colores para output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logHeader(message) {
  log(`\n${colors.bold}${colors.blue}=== ${message} ===${colors.reset}`);
}

async function checkFileExists(filePath, description) {
  if (fs.existsSync(filePath)) {
    logSuccess(`${description} existe: ${filePath}`);
    return true;
  } else {
    logError(`${description} no encontrado: ${filePath}`);
    return false;
  }
}

async function checkDirectoryStructure() {
  logHeader('Verificando Estructura de Directorios');
  
  const requiredDirs = [
    'apps',
    'apps/backend',
    'apps/frontend',
    'packages',
    'packages/types',
    'packages/shared',
    'packages/config',
    'scripts',
    'docs'
  ];

  let allExist = true;
  for (const dir of requiredDirs) {
    const exists = await checkFileExists(dir, `Directorio ${dir}`);
    if (!exists) allExist = false;
  }

  return allExist;
}

async function checkConfigFiles() {
  logHeader('Verificando Archivos de Configuración');
  
  const requiredFiles = [
    { path: 'package.json', desc: 'Package.json raíz' },
    { path: '.npmrc', desc: 'Configuración npm' },
    { path: 'tsconfig.json', desc: 'Configuración TypeScript' },
    { path: '.eslintrc.js', desc: 'Configuración ESLint' },
    { path: '.prettierrc', desc: 'Configuración Prettier' },
    { path: '.gitignore', desc: 'Git ignore' },
    { path: '.dockerignore', desc: 'Docker ignore' },
    { path: 'docker-compose.yml', desc: 'Docker Compose' },
    { path: 'env.example', desc: 'Variables de entorno ejemplo' },
    { path: 'README.md', desc: 'README principal' }
  ];

  let allExist = true;
  for (const file of requiredFiles) {
    const exists = await checkFileExists(file.path, file.desc);
    if (!exists) allExist = false;
  }

  return allExist;
}

async function checkPackageTypes() {
  logHeader('Verificando Package Types');
  
  const typeFiles = [
    { path: 'packages/types/package.json', desc: 'Package.json de types' },
    { path: 'packages/types/tsconfig.json', desc: 'TSConfig de types' },
    { path: 'packages/types/src/index.ts', desc: 'Index de types' },
    { path: 'packages/types/src/auth.ts', desc: 'Tipos de auth' },
    { path: 'packages/types/src/content.ts', desc: 'Tipos de content' },
    { path: 'packages/types/src/analytics.ts', desc: 'Tipos de analytics' }
  ];

  let allExist = true;
  for (const file of typeFiles) {
    const exists = await checkFileExists(file.path, file.desc);
    if (!exists) allExist = false;
  }

  return allExist;
}

async function checkDockerServices() {
  logHeader('Verificando Servicios Docker');
  
  try {
    // Verificar que Docker Compose esté corriendo
    const output = execSync('docker compose ps --format json', { encoding: 'utf8' });
    const services = JSON.parse(`[${output.trim().split('\n').join(',')}]`);
    
    const expectedServices = ['postgres', 'redis'];
    let allRunning = true;

    for (const serviceName of expectedServices) {
      const service = services.find(s => s.Service === serviceName);
      if (service) {
        if (service.State === 'running') {
          logSuccess(`Servicio ${serviceName} está corriendo`);
        } else {
          logError(`Servicio ${serviceName} no está corriendo (Estado: ${service.State})`);
          allRunning = false;
        }
      } else {
        logError(`Servicio ${serviceName} no encontrado`);
        allRunning = false;
      }
    }

    return allRunning;
  } catch (error) {
    logError(`Error verificando servicios Docker: ${error.message}`);
    return false;
  }
}

async function checkDatabaseConnection() {
  logHeader('Verificando Conexión a Base de Datos');
  
  try {
    // Verificar conexión a PostgreSQL
    execSync('docker compose exec -T postgres pg_isready -U replex_user -d replex_ai', { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    logSuccess('PostgreSQL está aceptando conexiones');

    // Verificar que los esquemas se crearon
    const schemaCheck = execSync(`docker compose exec -T postgres psql -U replex_user -d replex_ai -c "SELECT schema_name FROM information_schema.schemata WHERE schema_name IN ('auth', 'content', 'analytics');"`, {
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    if (schemaCheck.includes('auth') && schemaCheck.includes('content') && schemaCheck.includes('analytics')) {
      logSuccess('Esquemas de base de datos creados correctamente');
    } else {
      logWarning('Algunos esquemas de base de datos podrían no haberse creado');
    }

    return true;
  } catch (error) {
    logError(`Error verificando base de datos: ${error.message}`);
    return false;
  }
}

async function checkRedisConnection() {
  logHeader('Verificando Conexión a Redis');
  
  try {
    const output = execSync('docker compose exec -T redis redis-cli ping', { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    if (output.trim() === 'PONG') {
      logSuccess('Redis está respondiendo correctamente');
      return true;
    } else {
      logError('Redis no está respondiendo correctamente');
      return false;
    }
  } catch (error) {
    logError(`Error verificando Redis: ${error.message}`);
    return false;
  }
}

async function checkNodeVersion() {
  logHeader('Verificando Versión de Node.js');
  
  try {
    const version = execSync('node --version', { encoding: 'utf8' }).trim();
    const majorVersion = parseInt(version.replace('v', '').split('.')[0]);
    
    if (majorVersion >= 18) {
      logSuccess(`Node.js versión ${version} (✓ >= 18.20.0)`);
      return true;
    } else {
      logError(`Node.js versión ${version} (✗ requiere >= 18.20.0)`);
      return false;
    }
  } catch (error) {
    logError(`Error verificando Node.js: ${error.message}`);
    return false;
  }
}

async function checkNpmVersion() {
  logHeader('Verificando Versión de npm');
  
  try {
    const version = execSync('npm --version', { encoding: 'utf8' }).trim();
    const majorVersion = parseInt(version.split('.')[0]);
    
    if (majorVersion >= 9) {
      logSuccess(`npm versión ${version} (✓ >= 9.0.0)`);
      return true;
    } else {
      logError(`npm versión ${version} (✗ requiere >= 9.0.0)`);
      return false;
    }
  } catch (error) {
    logError(`Error verificando npm: ${error.message}`);
    return false;
  }
}

async function main() {
  log(`${colors.bold}${colors.blue}🎬 Replex AI - Verificación de Setup Fase 0${colors.reset}\n`);
  
  const checks = [
    { name: 'Versión de Node.js', fn: checkNodeVersion },
    { name: 'Versión de npm', fn: checkNpmVersion },
    { name: 'Estructura de directorios', fn: checkDirectoryStructure },
    { name: 'Archivos de configuración', fn: checkConfigFiles },
    { name: 'Package types', fn: checkPackageTypes },
    { name: 'Servicios Docker', fn: checkDockerServices },
    { name: 'Conexión a PostgreSQL', fn: checkDatabaseConnection },
    { name: 'Conexión a Redis', fn: checkRedisConnection }
  ];

  let allPassed = true;
  const results = [];

  for (const check of checks) {
    try {
      const result = await check.fn();
      results.push({ name: check.name, passed: result });
      if (!result) allPassed = false;
    } catch (error) {
      logError(`Error en verificación ${check.name}: ${error.message}`);
      results.push({ name: check.name, passed: false });
      allPassed = false;
    }
  }

  // Resumen final
  logHeader('Resumen de Verificación');
  
  results.forEach(result => {
    if (result.passed) {
      logSuccess(result.name);
    } else {
      logError(result.name);
    }
  });

  if (allPassed) {
    log(`\n${colors.bold}${colors.green}🎉 ¡Fase 0 completada exitosamente!${colors.reset}`);
    log(`${colors.green}Todos los servicios y configuraciones están funcionando correctamente.${colors.reset}`);
    log(`${colors.blue}Puedes proceder con la Fase 1: Autenticación e infraestructura core.${colors.reset}\n`);
    process.exit(0);
  } else {
    log(`\n${colors.bold}${colors.red}❌ Algunas verificaciones fallaron${colors.reset}`);
    log(`${colors.yellow}Por favor revisa los errores anteriores antes de continuar.${colors.reset}\n`);
    process.exit(1);
  }
}

// Ejecutar verificación
main().catch(error => {
  logError(`Error inesperado: ${error.message}`);
  process.exit(1);
}); 