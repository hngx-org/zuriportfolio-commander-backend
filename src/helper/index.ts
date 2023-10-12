export function isUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  return uuidRegex.test(id);
}

export function validateDateRange(valid_from: string, valid_to: string) {
  const currentTime = new Date();
  const fromTime = new Date(valid_from);
  const toTime = new Date(valid_to);
  const currentDay = currentTime.toDateString();
  const fromDay = fromTime.toDateString();

  let resp = { error: false, msg: '' };

  // Check if "valid_from" and "valid_to" have the same time frame
  if (fromTime.getTime() === toTime.getTime()) {
    resp.error = true;
    resp.msg = 'valid_from and valid_to cannot have the same time frame.';
    return resp;
  }

  // Check if "valid_from" is in the past
  if (fromTime < currentTime) {
    resp.error = true;
    resp.msg = 'valid_from must not be in the past.';
    return resp;
  }

  // Check if "valid_to" is not in the future
  if (toTime <= currentTime) {
    resp.error = true;
    resp.msg = 'valid_to must be in the future.';
    return resp;
  }

  if (fromTime < currentTime) {
    resp.error = true;
    resp.msg = `valid_from can't be less than current day .`;
    return resp;
  }
  return resp;
}
