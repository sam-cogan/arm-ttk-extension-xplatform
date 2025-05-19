# Test script to verify that Bicep experimental feature warnings are handled correctly
# This script simulates the Bicep warning by outputting a warning message to stderr

# Simulate the Bicep experimental features warning
Write-Error "WARNING: The following experimental Bicep features have been enabled: Extensibility. Experimental features should be enabled for testing purposes only, as there are no guarantees about the quality or stability of these features. Do not enable these settings for any production usage, or your production environment may be subject to breaking."

# Also output a real error to verify that legitimate errors are still caught
Write-Error "This is a real error that should be handled as an error"

Write-Host "Test completed"